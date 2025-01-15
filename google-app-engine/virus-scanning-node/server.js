/* eslint-disable import/no-commonjs */
/*
* Copyright 2019 Google LLC

* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at

*     https://www.apache.org/licenses/LICENSE-2.0

* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

const clamd = require('clamdjs');
const express = require('express');
const {Storage} = require('@google-cloud/storage');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const scanner = clamd.createScanner('127.0.0.1', 3310);

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

// Setup a rate limiter
const expressRateLimit = require('express-rate-limit');
// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);
const limiter = expressRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to X requests per windowMs
});
app.use(limiter);

// Creates a client
const storage = new Storage();

// start the app server
const run = () => app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

/**
 * Route that is invoked by a Cloud Function when a malware scan is requested
 * for a document uploaded to GCS.
 *
 * @param {object} req The request payload
 * @param {object} res The HTTP response object
 */
app.post('/scan', async (req, res) => {
  console.log('Request body', JSON.stringify(req.body));

  let tempPath;

  try {
    // get inputs
    console.log(' - Getting inputs...');
    const filename = req.body.filename;
    const projectId = req.body.projectId || process.env.PROJECT_ID;
    console.log(` - - filename = ${filename}`);
    console.log(` - - projectId = ${projectId}`);

    // validate inputs
    console.log(' - Validating inputs...');
    // get the bucket based on projectId
    const STORAGE_URL = projectId + '.appspot.com';
    console.log(`STORAGE_URL = ${STORAGE_URL}`);
    const bucket = storage.bucket(STORAGE_URL);
    const bucketExists = await bucket.exists();
    if (!bucketExists) {
      throw 'Storage bucket not found';
    }
    const file = bucket.file(filename);
    const fileExists = (await file.exists())[0]; // the file.exists() function returns an array with a single boolean element in it
    if (!fileExists) {
      throw 'File not found in bucket';
    }
    console.log(' - - Done');

    // download the file so it can be scanned locally
    tempPath = `/unscanned_files/${Date.now()}`;
    console.log(` - Downloading file to local temp path: ${tempPath}...`);
    await bucket.file(filename).download({ destination: tempPath });
    console.log(' - - Done');

    // scan the file
    console.log(' - Starting malware scan...');
    const result = await scanner.scanFile(tempPath);
    const status = result.indexOf('OK') > -1 ? 'clean' : 'infected';
    console.log(' - - Done');
    console.log(` - - File status: ${status}`);

    // add metadata with scan result
    console.log(' - Adding metadata to file...');
    addMetadata(bucket, filename, status);
    console.log(' - - Done');

    // respond to HTTP client
    console.log(' - Returning HTTP respnose...');
    res.json({ message: result, status: status });
    console.log(' - - Done');

  } catch(e) {
    console.error('*** ERROR ***', JSON.stringify(e));
    res.status(500).json({
      message: e.toString(),
      status: 'error',
    });
  } finally {
    if (tempPath) {
      console.log(' - Deleting temp file...');
      fs.unlink(tempPath, (err) => {
        if (err) {
          console.error('*** ERROR ***', JSON.stringify(err));
        } else {
          console.log(' - - Done');
        }
      });
    }
  }
});

/**
 * Add metadata to a file, to indicate the outcome of the virus scan
 *
 * @param {bucket} bucket
 * @param {string} filename
 * @param {string} status
 */
const addMetadata = (bucket, filename, status) => {
  const metadata = {
    metadata: {
      'scanned': Date.now().toString(),
      'status': status,
    },
  };
  bucket.file(filename).setMetadata(metadata).then((returned) => {
    return returned;
  }).catch(() => {
    return false;
  });
};

run();

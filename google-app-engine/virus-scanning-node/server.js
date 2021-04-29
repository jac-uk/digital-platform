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

// Creates a client
const storage = new Storage();

// Get the bucket which is declared as an environment variable
const STORAGE_URL = process.env.PROJECT_ID + '.appspot.com';
const bucket = storage.bucket(STORAGE_URL);

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
  console.log(`STORAGE_URL = ${STORAGE_URL}`);
  console.log('Request body', JSON.stringify(req.body));

  let tempPath;

  try {
    // get inputs
    const filename = req.body.filename;
    console.log(`Filename = ${filename}`);

    // validate inputs
    const bucketExists = await bucket.exists();
    if (!bucketExists) {
      throw 'Storage bucket not found';
    }
    const file = bucket.file(filename);
    const fileExists = (await file.exists())[0]; // the file.exists() function returns an array with a single boolean element in it
    if (!fileExists) {
      throw 'File not found in bucket';
    }

    // download the file so it can be scanned locally
    tempPath = `/unscanned_files/${Date.now()}`;
    console.log(` - Downloading file to local temp path: ${tempPath}`);
    await bucket.file(filename).download({ destination: tempPath });

    // scan the file
    const result = await scanner.scanFile(tempPath);
    const status = result.indexOf('OK') > -1 ? 'clean' : 'infected';
    console.log(` - Scan status: ${status}`);

    // add metadata with scan result
    addMetadata(filename, status);

    // respond to API client
    res.json({ message: result, status: status });

  } catch(e) {
    console.error(' - Error processing the file: ', e);
    res.status(500).json({
      message: e.toString(),
      status: 'error',
    });
  } finally {
    // delete the temporary file
    if (tempPath) {
      fs.unlink(tempPath);
    }
  }
});

/**
 * Add metadata to a file, to indicate the outcome of the virus scan
 *
 * @param {string} filename
 * @param {string} status
 */
const addMetadata = (filename, status) => {
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

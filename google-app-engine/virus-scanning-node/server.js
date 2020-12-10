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
const bodyParser = require('body-parser');
const {Storage} = require('@google-cloud/storage');

const app = express();
const PORT = process.env.PORT || 8080;
const scanner = clamd.createScanner('127.0.0.1', 3310);
const CLOUD_STORAGE_BUCKET = process.env.UNSCANNED_BUCKET;

app.use(bodyParser.json());

// Creates a client
const storage = new Storage();

// Get the bucket which is declared as an environment variable
// let srcbucket = storage.bucket(CLOUD_STORAGE_BUCKET);

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
  console.log('Request body', req.body);
  try {
    const filename = req.body.filename;

    const options = {
      destination: `/unscanned_files/${filename}`,
    };

    //Downloads the file
    await storage
      .bucket(CLOUD_STORAGE_BUCKET)
      .file(filename)
      .download(options);

    console.log(`Filename is: /unscanned_files/${filename}`);

    const result = await scanner.scanFile(`/unscanned_files/${filename}`);
    if (result.indexOf('OK') > -1) {

      // Add metadata with scan result
      addMetadata(filename, 'clean');

      // Log scan outcome for document
      console.log(`Scan status for ${filename}: CLEAN`);

      // Respond to API client
      res.json({status: 'clean'});
    } else {

      // Add metadata with scan result
      addMetadata(filename, 'infected');

      // Log scan outcome for document
      console.log(`Scan status for ${filename}: INFECTED`);

      // Respond to API client
      res.json({
        message: result,
        status: 'infected',
      });
    }
  } catch(e) {
    console.error('Error processing the file', e);
    res.status(500).json({
      message: e.toString(),
      status: 'error',
    });
  }
});


const addMetadata = (filename, status) => {
  // Add meta data to the file to indicate it has been scanned
  const metadata = {
    metadata: {
      'scanned': Date.now().toString(),
      'status': status,
    },
  };

  storage.bucket(CLOUD_STORAGE_BUCKET).file(filename).setMetadata(metadata).then((returned) => {
    return returned;
  }).catch(() => {
    return false;
  });
};

run();

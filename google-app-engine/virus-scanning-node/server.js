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

const express = require('express');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLAMAV_URL = 'https://<your-cloud-run-url>/scan'; // Update this URL
const CLEAN_BUCKET = 'cleanBucket';
const QUARANTINE_BUCKET = 'quarantineBucket';

const app = express();
const PORT = process.env.PORT || 8080;

// Setup a rate limiter
const expressRateLimit = require('express-rate-limit');
const limiter = expressRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to X requests per windowMs
});
app.use(limiter);

// Creates a client
const storage = new Storage();

// Start the app server
const run = () => app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

/**
 * Cloud Event handler invoked by Eventarc when a file is uploaded
 * to the Cloud Storage bucket.
 */
app.post('/', async (req, res) => {
  console.log('Received Cloud Event', JSON.stringify(req.body));

  try {
    const { bucket, name: filename } = req.body;
    await processFile(bucket, filename);
    res.status(200).send('File processed successfully');
  } catch (e) {
    console.error('*** ERROR ***', JSON.stringify(e));
    res.status(500).json({ message: e.toString(), status: 'error' });
  }
});

/**
 * Manually triggered scan via the /scan endpoint.
 */
app.post('/scan', async (req, res) => {
  console.log('Scan request', JSON.stringify(req.body));

  try {
    const { bucket, filename } = req.body;
    await processFile(bucket, filename);
    res.status(200).send('File scanned successfully');
  } catch (e) {
    console.error('*** ERROR ***', JSON.stringify(e));
    res.status(500).json({ message: e.toString(), status: 'error' });
  }
});

/**
 * Processes the file by triggering a scan via Cloud Run and then moving it
 * to the appropriate bucket based on the scan results.
 * 
 * @param {string} bucket - The name of the bucket where the file is stored
 * @param {string} filename - The name of the file to be processed
 */
async function processFile(bucket, filename) {
  let tempPath;

  try {
    console.log(`Processing file ${filename} in bucket ${bucket}...`);

    // Validate bucket and file existence
    const storageBucket = storage.bucket(bucket);
    const file = storageBucket.file(filename);
    const fileExists = (await file.exists())[0];
    if (!fileExists) {
      throw 'File not found in bucket';
    }

    // Clear existing metadata to prevent abuse or manipulation
    await clearMetadata(storageBucket, filename);
    console.log(`Cleared metadata for ${filename}`);

    // Download the file for local processing
    tempPath = path.join('/tmp', filename);
    console.log(`Downloading file to local temp path: ${tempPath}...`);
    await file.download({ destination: tempPath });

    // Scan the file using the Cloud Run service
    console.log('Starting malware scan via Cloud Run...');
    const result = await scanFileInCloudRun(tempPath);
    const status = result.status === 'clean' ? 'clean' : 'infected';
    console.log(`File status: ${status}`);

    // Move file based on scan result
    let destinationBucket;
    if (status === 'clean') {
      destinationBucket = storage.bucket(CLEAN_BUCKET);
    } else {
      destinationBucket = storage.bucket(QUARANTINE_BUCKET);
    }

    await file.move(destinationBucket.file(filename));
    console.log(`File moved to ${destinationBucket.name}`);

    // Add metadata to the file based on the scan result
    await addMetadata(destinationBucket, filename, status);
    console.log(`Added metadata to ${filename}`);
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      console.log('Deleting temp file...');
      fs.unlink(tempPath, (err) => {
        if (err) {
          console.error('*** ERROR ***', JSON.stringify(err));
        } else {
          console.log('Temp file deleted');
        }
      });
    }
  }
}

/**
 * Function to call the Cloud Run ClamAV service to scan the file.
 * 
 * @param {string} filePath - The local path to the file to be scanned
 * @returns {Object} - The result of the scan
 */
async function scanFileInCloudRun(filePath) {
  try {
    const response = await axios.post(CLAMAV_URL, { filePath: filePath });
    return response.data;
  } catch (error) {
    console.error('Error scanning file in Cloud Run:', error);
    throw new Error('Error scanning file');
  }
}

/**
 * Clears specific metadata fields from a file.
 * 
 * @param {Object} bucket - The storage bucket containing the file
 * @param {string} filename - The name of the file to clear metadata for
 */
async function clearMetadata(bucket, filename) {
  const metadata = {
    metadata: {
      'scanned': null,
      'status': null,
    },
  };
  try {
    await bucket.file(filename).setMetadata(metadata);
    console.log(`Metadata cleared for ${filename}`);
  } catch (error) {
    console.error('Error clearing metadata:', error);
  }
}

/**
 * Add metadata to a file, to indicate the outcome of the virus scan.
 *
 * @param {Object} bucket - The storage bucket containing the file
 * @param {string} filename - The name of the file to add metadata to
 * @param {string} status - The status of the file (clean/infected)
 */
async function addMetadata(bucket, filename, status) {
  const metadata = {
    metadata: {
      'scanned': Date.now().toString(),
      'status': status,
    },
  };
  try {
    await bucket.file(filename).setMetadata(metadata);
    console.log(`Metadata added to ${filename}`);
  } catch (error) {
    console.error('Error adding metadata:', error);
  }
}

run();

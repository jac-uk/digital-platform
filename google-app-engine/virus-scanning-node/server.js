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

const express = require('express');
const { Storage } = require('@google-cloud/storage');
const clamd = require('clamdjs');
const { readAndVerifyConfig } = require('./config.js');
const { GoogleAuth } = require('google-auth-library');
const util = require('node:util');
const execFile = util.promisify(require('node:child_process').execFile);

const PORT = process.env.PORT || 8080;
const CLAMD_HOST = '127.0.0.1';
const CLAMD_PORT = 3310;
const MAX_FILE_SIZE = 500000000; // 500MiB

const app = express();
app.use(express.json());

const storage = new Storage();
const googleAuth = new GoogleAuth();

// Create ClamAV scanner instance
const scanner = clamd.createScanner(CLAMD_HOST, CLAMD_PORT);

let BUCKET_CONFIG = {
  buckets: [],
  ClamCvdMirrorBucket: '',
};

// Function to scan a file using ClamAV
async function scanWithClamAV(fileStream) {
  return new Promise((resolve, reject) => {
    scanner.scanStream(fileStream, 600000) // 10 minutes timeout
      .then((result) => {
        resolve({
          isSafe: clamd.isCleanReply(result),
          result,
        });
        return result;
      })
      .catch(reject);
  });
}

// Function to add metadata to the file in the bucket
async function addMetadata(bucket, filename, status) {
  const file = bucket.file(filename);
  await file.setMetadata({
    metadata: { scan_status: status },
  });
}

// Route for scanning files manually
app.post('/scan', async (req, res) => {
  console.log('Request body:', JSON.stringify(req.body));

  try {
    console.log(' - Getting inputs...');
    const { filename, projectId } = req.body;
    const storageUrl = projectId ? `${projectId}.appspot.com` : BUCKET_CONFIG.buckets[0].unscanned;
    console.log(` - - filename = ${filename}`);
    console.log(` - - storageUrl = ${storageUrl}`);

    // Validate inputs and get the bucket
    const bucket = storage.bucket(storageUrl);
    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
      throw new Error('Storage bucket not found');
    }
    const file = bucket.file(filename);
    const [fileExists] = await file.exists();
    if (!fileExists) {
      throw new Error('File not found in bucket');
    }

    // Check file size
    const [metadata] = await file.getMetadata();
    const fileSize = metadata.size;
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File size ${fileSize} exceeds the maximum allowed size of ${MAX_FILE_SIZE}`);
    }
    console.log(' - - Done');

    // Create a read stream from the file in the bucket
    console.log(' - Starting malware scan...');
    const readStream = file.createReadStream();
    const { isSafe, result } = await scanWithClamAV(readStream);
    const status = isSafe ? 'clean' : 'infected';
    console.log(' - - Done');
    console.log(` - - File status: ${status}`);

    // Add metadata with scan result
    console.log(' - Adding metadata to file...');
    await addMetadata(bucket, filename, status);
    console.log(' - - Done');

    // Respond to HTTP client
    console.log(' - Returning HTTP response...');
    res.json({ message: result, status });
    console.log(' - - Done');

  } catch (e) {
    console.error('*** ERROR ***', JSON.stringify(e));
    res.status(500).json({
      message: e.toString(),
      status: 'error',
    });
  }
});

// Route for handling GCS events
app.post('/', async (req, res) => {
  console.log('Eventarc request body:', JSON.stringify(req.body));

  try {
    const file = req.body;
    if (file.kind === 'storage#object') {
      await handleGcsObject(file, res);
    } else if (file.kind === 'schedule#cvd_update') {
      await handleCvdUpdate(res);
    } else {
      res.status(400).json({
        message: `${JSON.stringify(req.body)} is not supported (kind must be storage#object or schedule#cvd_update)`,
        status: 'error',
      });
    }
  } catch (e) {
    console.error('*** ERROR ***', JSON.stringify(e));
    res.status(500).json({
      message: e.toString(),
      status: 'error',
    });
  }
});

/**
 * Handle a GCS object event
 */
async function handleGcsObject(file, res) {
  try {
    if (!file || !file.name) {
      throw new Error(`File name not specified in ${file}`);
    }
    if (!file || !file.bucket) {
      throw new Error(`Bucket name not specified in ${file}`);
    }

    const fileSize = parseInt(file.size, 10);
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File gs://${file.bucket}/${file.name} too large for scanning at ${fileSize} bytes`);
    }

    const config = BUCKET_CONFIG.buckets.find(
      (c) => c.unscanned === file.bucket
    );
    if (!config) {
      throw new Error(`Bucket name - ${file.bucket} not in config`);
    }

    const gcsFile = storage.bucket(file.bucket).file(file.name);
    if (!(await gcsFile.exists())[0]) {
      console.warn(`Ignoring no longer existing file: gs://${file.bucket}/${file.name}`);
      res.json({ status: 'deleted' });
      return;
    }

    const clamdVersion = await getClamVersion();
    console.info(`Scan request for gs://${file.bucket}/${file.name}, (${fileSize} bytes) scanning with clam ${clamdVersion}`);
    const startTime = Date.now();
    const readStream = await gcsFile.createReadStream();
    let result;
    try {
      result = await scanWithClamAV(readStream);
    } finally {
      readStream.destroy();
    }
    const scanDuration = Date.now() - startTime;

    if (clamd.isCleanReply(result)) {
      console.info(`Scan status for gs://${file.bucket}/${file.name}: CLEAN (${fileSize} bytes in ${scanDuration} ms)`);
      // Move document to clean bucket
      await moveProcessedFile(file.name, true, config);
      res.json({ status: 'clean', clam_version: clamdVersion });
    } else {
      console.warn(`Scan status for gs://${file.bucket}/${file.name}: INFECTED ${result} (${fileSize} bytes in ${scanDuration} ms)`);
      // Move document to quarantined bucket
      await moveProcessedFile(file.name, false, config);
      res.json({
        message: result,
        status: 'infected',
        result: result,
        clam_version: clamdVersion,
      });
    }
  } catch (e) {
    console.error('*** ERROR ***', JSON.stringify(e));
    res.status(500).json({
      message: e.toString(),
      status: 'error',
    });
  }
}

/**
 * Handle a CVD update request
 */
async function handleCvdUpdate(res) {
  try {
    console.info('Starting CVD Mirror update');
    const result = await execFile('./updateCvdMirror.sh', [
      BUCKET_CONFIG.ClamCvdMirrorBucket,
    ]);
    console.info('CVD Mirror update check complete. output:\n' + result.stdout);
    const newVersions = result.stdout
      .split('\n')
      .filter((line) => line.indexOf('Downloaded') >= 0);
    for (const version of newVersions) {
      console.info(`CVD Mirror updated: ${version}`);
    }
    res.json({
      status: 'CvdUpdateComplete',
      updated: newVersions.length > 0,
    });
  } catch (err) {
    console.error('*** ERROR ***', JSON.stringify(err));
    res.status(500).json({ message: err.message, status: 'CvdUpdateError' });
  }
}

/**
 * Wrapper to get a clean string with the version of CLAM.
 */
async function getClamVersion() {
  return (await clamd.version(CLAMD_HOST, CLAMD_PORT)).replace('\x00', '');
}

/**
 * Move the file to the appropriate bucket.
 */
async function moveProcessedFile(filename, isClean, config) {
  const srcfile = storage.bucket(config.unscanned).file(filename);
  const destinationBucketName = isClean
    ? `gs://${config.clean}`
    : `gs://${config.quarantined}`;
  const destinationBucket = storage.bucket(destinationBucketName);
  await srcfile.move(destinationBucket);
}

// Load configuration and start server
(async function initializeServer() {
  try {
    const configFile = 'config.json';
    BUCKET_CONFIG = await readAndVerifyConfig(configFile);

    // Obtain project ID if not set
    let projectId = process.env.PROJECT_ID;
    if (!projectId) {
      projectId = await googleAuth.getProjectId();
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();

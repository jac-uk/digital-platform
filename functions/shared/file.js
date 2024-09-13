import os from 'os';
import path from 'path';
import fs from 'fs';
const fs_promises = fs.promises;

export {
  writeToLocalFile,
  deleteLocalFile,
  uploadToStorageBucket,
  getTempLocalFilePath
};

/**
 * Delete a file from the local filesystem
 * @param {*} filePath 
 * @returns 
 */
function deleteLocalFile(filePath) {
  return fs.unlinkSync(filePath);
}

/**
 * Upload local file to the backup Cloud Storage bucket
 * @param {*} bucket 
 * @param {*} localPath 
 * @param {*} destinationFilePath 
 */
async function uploadToStorageBucket(bucket, localPath, destinationFilePath) {
  console.log('Uploading ' + destinationFilePath + '...');
  await bucket.upload(localPath, {
    destination: destinationFilePath,
  });
}

function getTempLocalFilePath(prefix) {
  const timestamp = (new Date()).toISOString();
  let fileName;
  if (prefix) {
    fileName = `${prefix}-`;
  }
  fileName += `${timestamp}.json`;
  return path.join(os.tmpdir(), fileName);
}

async function writeToLocalFile(filePath, data) {
  return await fs_promises.writeFile(filePath, data);
}

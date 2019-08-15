const PROJECT_ID = process.env.GCLOUD_PROJECT;
const BACKUP_BUCKET = `${PROJECT_ID}-backups`;
const BACKUP_PATH = '/authentication/';
const BACKUP_SCHEDULE = 'every 1 hours synchronized';

const admin = require('firebase-admin');
const firebaseTools = require('firebase-tools');
const fs = require('fs');
const functions = require('firebase-functions');
const os = require('os');
const path = require('path');

// Download auth export file to the local filesystem
const downloadAuthExport = async (filePath) => {
  await firebaseTools.auth.export(filePath, {
    project: PROJECT_ID,
  });
};

// Upload local file to the backup Cloud Storage bucket
const uploadToStorageBucket = async (localPath, fileName) => {
  const bucket = admin.storage().bucket(BACKUP_BUCKET);
  await bucket.upload(localPath, {
    destination: BACKUP_PATH + fileName,
  });
};

// Delete a file from the local filesystem
const deleteLocalFile = (filePath) => {
  return fs.unlinkSync(filePath);
};

// Main handler function
const main = async () => {
  const timestamp = (new Date()).toISOString();
  const fileName = timestamp + '.json';
  const tempFilePath = path.join(os.tmpdir(), fileName);

  await downloadAuthExport(tempFilePath);
  await uploadToStorageBucket(tempFilePath, fileName);
  deleteLocalFile(tempFilePath);
};

module.exports = functions.pubsub.schedule(BACKUP_SCHEDULE).onRun(main);

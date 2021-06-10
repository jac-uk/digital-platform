/**
 * Backup authentication
 */
const admin = require('firebase-admin');
const firebaseTools = require('firebase-tools');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = (config) => {
  const BACKUP_BUCKET = `${config.PROJECT_ID}-backups`;
  const BACKUP_PATH = 'authentication/';
  const PROJECT_ID = config.PROJECT_ID;
  const slack = require('../../shared/slack')(config);
  return {
    backupAuthentication,
  };

  async function backupAuthentication() {
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

    const timestamp = (new Date()).toISOString();
    const fileName = timestamp + '.json';
    const tempFilePath = path.join(os.tmpdir(), fileName);

    try {
      await downloadAuthExport(tempFilePath);
      await uploadToStorageBucket(tempFilePath, fileName);
      deleteLocalFile(tempFilePath);
    } catch (err) {
      slack.post('ERROR: Authentication backup failed');
      slack.post(err);
      console.log('backupAuthentication error', err);
      throw new Error('Export operation failed');
    }
  }
};

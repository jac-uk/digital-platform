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
  const BACKUP_PATH = 'authentication';
  const PROJECT_ID = config.PROJECT_ID;
  const slack = require('../../shared/slack')(config);
  return {
    backupAuthentication,
  };

  async function backupAuthentication() {

    // Download auth export file to the local filesystem
    const downloadAuthExport = async (filePath) => {
      console.log('Downloading ' + filePath + '...');
      await firebaseTools.auth.export(filePath, {
        project: PROJECT_ID,
      });
    };

    const bucket = admin.storage().bucket(BACKUP_BUCKET);

    // Upload local file to the backup Cloud Storage bucket
    const uploadToStorageBucket = async (localPath, fileName) => {
      console.log('Uploading ' + fileName + '...');
      await bucket.upload(localPath, {
        destination: BACKUP_PATH + '/' + fileName,
      });
    };

    // Delete a file from the local filesystem
    const deleteLocalFile = (filePath) => {
      return fs.unlinkSync(filePath);
    };

    // Delete all backup files more than 30 days old
    const purgeBackupHistory = async () => {
      console.log('Purging backup history...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const [files] = await bucket.getFiles({
        'prefix': BACKUP_PATH,
      });
      files.forEach(file => {
        if (file.name < `${BACKUP_PATH}/${thirtyDaysAgo.toISOString()}.json`) { // each backup is a file named as a timestamp converted to ISO strings
          console.log('Deleting ' + file.name);
          file.delete();
        }
      });
    };

    const timestamp = (new Date()).toISOString();
    const fileName = timestamp + '.json';
    const tempFilePath = path.join(os.tmpdir(), fileName);

    try {
      await downloadAuthExport(tempFilePath);
      await uploadToStorageBucket(tempFilePath, fileName);
      deleteLocalFile(tempFilePath);
      await purgeBackupHistory();
    } catch (err) {
      slack.post('ERROR: Authentication backup failed');
      slack.post(err);
      console.log('backupAuthentication error', err);
      throw new Error('Export operation failed');
    }

  }
};

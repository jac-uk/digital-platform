/**
 * Backup authentication
 */
import firebaseTools from 'firebase-tools';
import os from 'os';
import path from 'path';
import initSlack from '../../shared/slack.js';

import { deleteLocalFile, uploadToStorageBucket } from '../../shared/file.js';

export default (firebase) => {
  const BACKUP_BUCKET = `${process.env.PROJECT_ID}-backups`;
  const BACKUP_PATH = 'authentication';
  const PROJECT_ID = process.env.PROJECT_ID;

  const slack = initSlack();
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

    const bucket = firebase.storage().bucket(BACKUP_BUCKET);

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
    const destinationFilePath = BACKUP_PATH + '/' + fileName;

    try {
      await downloadAuthExport(tempFilePath);
      await uploadToStorageBucket(bucket, tempFilePath, destinationFilePath);
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

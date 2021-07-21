/**
 * Backup firestore
 */
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const admin = require('firebase-admin');

module.exports = (config) => {
  const slack = require('../../shared/slack')(config);
  return {
    backupFirestore,
  };

  async function backupFirestore() {

    const BACKUP_BUCKET = `${config.PROJECT_ID}-backups`;
    const BACKUP_PATH = 'firestore';

    const exportPath = `gs://${BACKUP_BUCKET}/${BACKUP_PATH}/${(new Date()).toISOString()}`;
    const databaseName = client.databasePath(config.PROJECT_ID, '(default)');

    try {
      console.log('Exporting firestore (i.e., taking database backup)...');
      const responses = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: exportPath,
        collectionIds: [],
      });
      const response = responses[0];
      slack.post(`SUCCESS: Firestore backup to ${exportPath} succeeded`);
      console.log(`Operation Name: ${response['name']}`);

      // Delete all backup files more than 30 days old
      console.log('Purging backup history...');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      // const bucket = admin.storage().bucket(BACKUP_BUCKET);
      // const [folders] = await bucket.getFiles({
      //   'prefix': BACKUP_PATH,
      // });
      const [folders] = await admin.storage().getBuckets({
        'prefix': `${BACKUP_BUCKET}/${BACKUP_PATH}`,
      });
      folders.forEach(async (folder) => {
        console.log('Processing folder: ' + folder.name);
        if (folder.name < `${BACKUP_PATH}/${thirtyDaysAgo.toISOString()}`) { // each backup is contained within a folder named as a timestamp converted to ISO strings
          console.log('Deleting ' + folder.name);
          // await folder.delete();
        }
      });

      return response;

    } catch (err) {
      slack.post(`ERROR: Firestore backup to ${exportPath} failed`);
      slack.post(err);
      console.log('backupFirestore error', err);
      throw new Error('Export operation failed');
    }
  }

};

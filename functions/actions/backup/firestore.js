/**
 * Backup firestore
 */
import firestore from '@google-cloud/firestore';
import initSlack from '../../shared/slack.js';

const client = new firestore.v1.FirestoreAdminClient();

export default (firebase) => {
  const slack = initSlack();
  return {
    backupFirestore,
  };

  async function backupFirestore() {

    const BACKUP_BUCKET = `${process.env.PROJECT_ID}-backups`;
    const BACKUP_PATH = 'firestore';

    const exportPath = `gs://${BACKUP_BUCKET}/${BACKUP_PATH}/${(new Date()).toISOString()}`;
    const databaseName = client.databasePath(process.env.PROJECT_ID, '(default)');

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
      const dateThirtyDaysAgo = thirtyDaysAgo.toISOString().split('T')[0];
      const bucket = firebase.storage().bucket(BACKUP_BUCKET);
      // delete files in the firestore directory that start with the date 30 days ago
      await bucket.deleteFiles({
        prefix: `${BACKUP_PATH}/${dateThirtyDaysAgo}`,
      });
      slack.post(`SUCCESS: Firestore backup from ${dateThirtyDaysAgo} purged successfully`);
      return true;

    } catch (err) {
      slack.post(`ERROR: Firestore backup to ${exportPath} failed`);
      slack.post(err);
      console.log('backupFirestore error', err);
      throw new Error('Export operation failed');
    }
  }

};

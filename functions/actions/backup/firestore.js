/**
 * Backup firestore
 */
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

module.exports = (config) => {
  const slack = require('../../shared/slack')(config);
  return {
    backupFirestore,
  };

  async function backupFirestore() {
    const bucket = `gs://${config.PROJECT_ID}-backups/firestore/${(new Date()).toISOString()}`;
    const databaseName = client.databasePath(config.PROJECT_ID, '(default)');
    try {
      const responses = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        collectionIds: [],
      });
      const response = responses[0];
      slack.post(`SUCCESS: Firestore backup to ${bucket} succeeded`);
      console.log(`Operation Name: ${response['name']}`);
      return response;
    } catch (err) {
      slack.post(`ERROR: Firestore backup to ${bucket} failed`);
      slack.post(err);
      console.log('backupFirestore error', err);
      throw new Error('Export operation failed');
    }
  }

};

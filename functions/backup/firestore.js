const PROJECT_ID = process.env.GCLOUD_PROJECT;
const BACKUP_PATH = `gs://${PROJECT_ID}-backups/firestore/`;
const BACKUP_SCHEDULE = 'every 1 hours synchronized';

const axios = require('axios');
const functions = require('firebase-functions');
const { google } = require('googleapis');

// Get Google auth access token so we can perform authenticated API calls
const getAccessToken = async () => {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/datastore'],
  });
  const accessTokenResponse = await auth.getAccessToken();
  return accessTokenResponse.token;
};

// Construct a backup destination path based on the current time
const getBackupPath = () => {
  const timestamp = (new Date()).toISOString();
  if (BACKUP_PATH.endsWith('/')) {
    return BACKUP_PATH + timestamp;
  } else {
    return BACKUP_PATH + '/' + timestamp;
  }
};

// Call the exportDocuments command using the Firestore REST API
const exportDocuments = (accessToken, path) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + accessToken,
  };
  const body = {
    outputUriPrefix: path,
  };
  const url = `https://firestore.googleapis.com/v1beta1/projects/${PROJECT_ID}/databases/(default):exportDocuments`;
  return axios.post(url, body, { headers });
};

// Main handler function
const main = async () => {
  const accessToken = await getAccessToken();
  const backupPath = getBackupPath();

  try {
    console.log(`Exporting Firestore database for project "${PROJECT_ID}" to Cloud Storage path "${backupPath}"`);
    const response = await exportDocuments(accessToken, backupPath);
    console.log('Response from Firestore API:', JSON.stringify(response.data));
  } catch (e) {
    if (e.response) {
      console.error('Response from Firestore API:', JSON.stringify(e.response.data));
    }
    throw e;
  }
};

module.exports = functions.pubsub.schedule(BACKUP_SCHEDULE).onRun(main);

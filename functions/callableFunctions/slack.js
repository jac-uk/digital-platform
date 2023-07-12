const functions = require('firebase-functions');
const config = require('../shared/config');
const { expressReceiver } = require('../shared/slack')(config);

// https://{your domain}.cloudfunctions.net/slack/events
module.exports = functions.region('europe-west2').https.onRequest(expressReceiver.app);

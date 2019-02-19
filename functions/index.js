use "strict"

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const NotifyClient = require('notifications-node-client').NotifyClient
const notifyClient = new NotifyClient(functions.config().notify.api_key)

admin.initializeApp();

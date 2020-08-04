/**
 * Initialises Firebase SDK and exports firestore database connection
 */
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

firebase.initializeApp(config);

exports.firebase = firebase;
exports.app = firebase.app();
exports.db = firebase.firestore();
exports.auth = firebase.auth();

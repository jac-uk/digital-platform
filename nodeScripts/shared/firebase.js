/**
 * Initialises Firebase SDK and exports firestore database connection
 */
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

const config = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(config);

exports.firebase = firebase;
exports.app = firebase.app();
exports.db = firebase.firestore();
exports.auth = firebase.auth();

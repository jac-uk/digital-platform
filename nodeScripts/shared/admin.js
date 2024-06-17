/**
 * Initialises Admin SDK and exports firestore database connection
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldPath, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');

const app = initializeApp();

exports.firebase = {
  firestore: { FieldPath, FieldValue, Timestamp },
};
exports.db = getFirestore(app);
exports.app = app;
exports.auth = getAuth(app);
exports.storage = getStorage(app);

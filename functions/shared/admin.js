/**
 * Initialises Admin SDK and exports firestore database connection
 */
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');

const app = initializeApp();

exports.firebase = admin.firebase;
exports.app = app;
exports.db = getFirestore(app);
exports.auth = getAuth(app);

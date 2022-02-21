/**
 * Initialises Admin SDK and exports firestore database connection
 */
const admin = require('firebase-admin');
const grpc = require('grpc');

admin.initializeApp();

const firestore = admin.firestore();
firestore.settings({ grpc });

exports.firebase = admin;
exports.db = firestore;
exports.app = admin.app();
exports.auth = admin.auth();

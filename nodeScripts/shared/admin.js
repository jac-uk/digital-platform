/**
 * Initialises Admin SDK and exports firestore database connection
 */
const admin = require('firebase-admin');

admin.initializeApp();

exports.firebase = admin;
exports.db = admin.firestore();
// exports.storage = admin.storage();
exports.app = admin.app();
exports.auth = admin.auth();

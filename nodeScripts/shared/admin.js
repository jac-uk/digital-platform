/**
 * Initialises Admin SDK and exports firestore database connection
 */
const admin = require('firebase-admin');
const { initializeAppCheck, ReCaptchaV3Provider } = require('firebase/app-check');

const app = admin.initializeApp();

// App check
initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.VUE_APP_RECAPTCHA_TOKEN),
    // Optional argument. If true, the SDK automatically refreshes App Check
    // tokens as needed.
    isTokenAutoRefreshEnabled: true,
});

// Other firebase exports
exports.firebase = admin;
exports.db = admin.firestore();
exports.app = admin.app();
exports.auth = admin.auth();

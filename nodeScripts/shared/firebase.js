/**
 * Initialises Firebase SDK and exports firestore database connection
 */
import firebaseApp from 'firebase/app';

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

export const firebase = firebaseApp;
export const app = firebase.app();
export const db = firebase.firestore();
export const auth = firebase.auth();

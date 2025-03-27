/**
 * Initialises Admin SDK and exports firestore database connection
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export const app = initializeApp();

// Global properties for firebase functions
import { setGlobalOptions } from 'firebase-functions/v2';
setGlobalOptions({ region: 'europe-west2' });

export const firebase = {
  firestore: { FieldPath, FieldValue, Timestamp },
  storage: function() {
    return getStorage(app);
  },
};
export const db = getFirestore(app);
export const auth = getAuth(app);

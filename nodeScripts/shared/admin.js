/**
 * Initialises Admin SDK and exports firestore database connection
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export const app = initializeApp();

export const firebase = {
  firestore: { FieldPath, FieldValue, Timestamp },
  storage: function() {
    return getStorage(app);
  },
};
export const db = getFirestore(app);
export const auth = getAuth(app);

// export const projectId = app.options.credential.projectId;
export const projectId = 'digital-platform-develop';
export const environment = whichEnvironment(projectId);
export const isProduction = environment === 'production';

/**
 * Check current firebase project is which environment
 * 
 * @param {string} projectId 
 * @returns {string} one of environment literal: ['production', 'staging', 'develop'] 
 */
function whichEnvironment(projectId) {
  const lowercaseProjectId = projectId.toLowerCase();
  const environmentMarks = {
    production: [
      'production',
      'prod',
      'live',
    ],
    staging: [
      'staging',
    ],
    develop: [
      'develop',
      'dev',
    ],
  };

  for (const [environment, marks] of Object.entries(environmentMarks)) {
    for (const mark of marks) {
      if (lowercaseProjectId.includes(mark)) return environment;
    }
  }
  
  return '';
}

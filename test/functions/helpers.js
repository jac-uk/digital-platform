const projectConfig = {
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
import initFirebaseFunctionsTest from 'firebase-functions-test';

const firebaseFunctionsTest = initFirebaseFunctionsTest(projectConfig, './service-account.json');

function generateMockContext(params = {}) {
  return {
    auth: {
      token: {
        rp: params.permissions || [],
      },
    },
  };
}

export {
  firebaseFunctionsTest,
  generateMockContext
};

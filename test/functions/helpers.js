const firebaseFunctionsTest = require('firebase-functions-test');

let firebaseFunctionsTestInstance;

const projectConfig = {
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
if (process.env.CI === 'true') {
  firebaseFunctionsTestInstance = firebaseFunctionsTest(projectConfig, null);
} else {
  // Initialize firebase-functions-test with projectConfig and a local service-account.json
  firebaseFunctionsTestInstance = firebaseFunctionsTest(projectConfig, './service-account.json');
}

function generateMockContext(params = {}) {
  return {
    auth: {
      token: {
        rp: params.permissions || [],
      },
    },
  };
}

module.exports = {
  firebaseFunctionsTest: firebaseFunctionsTestInstance,
  generateMockContext,
};

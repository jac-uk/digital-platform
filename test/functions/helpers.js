const projectConfig = {
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

console.log(process.env.FIREBASE_PROJECT_ID);

const firebaseFunctionsTest = require('firebase-functions-test')(projectConfig, './service-account.json');

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
  firebaseFunctionsTest,
  generateMockContext,
};

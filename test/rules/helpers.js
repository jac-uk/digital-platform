const firebase = require('@firebase/rules-unit-testing');
const fs = require('fs');
const admin = require('firebase-admin');

const projectId = `rules-spec-${Date.now()}`;

module.exports.setup = async (auth, data) => {

  const rules = fs.readFileSync('database/firestore.rules', 'utf8');

  const app = await firebase.initializeTestApp({
    projectId,
    auth,
  });

  const db = app.firestore();

  if (data) {
    const adminApp = await firebase.initializeAdminApp({
      projectId: projectId,
    });
    const adminDb = adminApp.firestore();
    for (const key in data) {
      const ref = adminDb.doc(key);
      await ref.set(data[key]);
    }
  }

  await firebase.loadFirestoreRules({
    projectId,
    rules: rules,
  });

  return db;
};

module.exports.teardown = async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
};

module.exports.setupAdmin = async (db, data) => {
  const app = await firebase.initializeAdminApp({
    projectId: db.app.options.projectId,
  });
  const adminDb = app.firestore();
  if (data) {
    for (const key in data) {
      const ref = adminDb.doc(key);
      await ref.set(data[key]);
    }
  }
  return adminDb;
};

module.exports.getTimeStamp = (date) => {
  return admin.firestore.Timestamp.fromDate(date);
};

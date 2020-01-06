const firebase = require('@firebase/testing');
const fs = require('fs');

const projectId = `rules-spec-${Date.now()}`;

module.exports.setup = async (auth, data) => {
  
  const firebasePort = require("../../firebase.json").emulators.firestore.port;
  const port = firebasePort /** Exists? */ ? firebasePort : 8080;
  const rules = fs.readFileSync("firestore.rules", "utf8");

  const app = await firebase.initializeTestApp({
    projectId,
    auth
  });
  const db = app.firestore();

  if (data) {
    const adminApp = await firebase.initializeAdminApp({
      projectId: projectId
    }); 
    const adminDb = adminApp.firestore();
    for (const key in data) {
      const ref = adminDb.doc(key);
      await ref.set(data[key]);
    }
  }

  await firebase.loadFirestoreRules({
    projectId,
    rules: rules
  });

  return db;
};

module.exports.teardown = async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));  
};

module.exports.setupAdmin = async (db, data) => {
  const app = await firebase.initializeAdminApp({
    projectId: db.app.options.projectId
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

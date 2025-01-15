'use strict';

import { app, db } from '../functions/shared/admin.js';

const main = async () => {
  const documentId = 'JypoxJYQCvV5MEU3T5u3';
  const collectionName = 'exercises';

  const snap = await db.collection(`${collectionName}_deleted`).doc(documentId).get();
  if (snap.exists) {
    const docData = snap.data();
    delete docData.deletedAt;
    await db.collection(collectionName).doc(documentId).set(docData);
    await db.collection(`${collectionName}_deleted`).doc(documentId).delete();
    return true;
  } else {

    return false;
  }
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });

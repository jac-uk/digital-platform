const admin = require("firebase-admin");
const firestore = admin.firestore();
const {Storage} = require('@google-cloud/storage');
const moveToGoogleDrive = require('./moveToGoogleDrive');

const getReferenceIdFromObjectName = (name) => {
  const regex = /\/(.*)\/.*$/;
  const matches = name.match(regex);
  return matches[1];
};

const deleteFromCloudStorage = (object) => {
  const gcs = new Storage();
  return gcs.bucket(object.bucket)
    .file(object.name)
    .delete();
};

const processUpload = async (object) => {
  console.log(`Processing file "${object.name}"`);

  const referenceId = getReferenceIdFromObjectName(object.name);
  const reference = await firestore.collection('references').doc(referenceId).get();

  if (reference.data().state === 'pending') {
    await moveToGoogleDrive(object, reference);
    await reference.ref.update({state: 'received'});
    console.log(`Reference ${referenceId} received`);
  } else {
    console.log(`Reference ${referenceId} has already been received – ignoring this file`);
  }

  await deleteFromCloudStorage(object);
  console.log('File deleted from Cloud Storage');
};

module.exports = processUpload;

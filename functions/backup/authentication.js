/*eslint-disable no-unused-vars*/
const backupBucket = 'jac-firebase-backups';
const backupPath = '/authentication/';
const batchSize = 1000;
const frequency = 'every 12 hours';

const admin = require('firebase-admin');
const fs = require('fs');
const functions = require('firebase-functions');
const os = require('os');
const path = require('path');
const { promisify, } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const listUsers = async (users, nextPageToken) => {
  const results = await admin.auth().listUsers(batchSize, nextPageToken);
  results.users.forEach((userRecord) => {
    users.push(userRecord);
  });
  // Get next batch of users.
  if (results.pageToken) {
    listUsers(users, results.pageToken);
  }
  return users;
};

const uploadToBackupBucket = async (users) => {
  const date = new Date();
  const fileName = date.toISOString() + '.json';
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = {
    contentType: 'application/json',
  };

  // Because fs does not return promises.
  await writeFileAsync(tempFilePath, users);

  const bucket = admin.storage().bucket(backupBucket);
  await bucket.upload(tempFilePath, {
    destination: backupPath + fileName,
    metadata: metadata,
  });
  return fs.unlinkSync(tempFilePath);
};

const main = async () => {
  const users = [];
  await listUsers(users, undefined);
  await uploadToBackupBucket(JSON.stringify(users, null, 2));
  return true;
};

module.exports = functions.pubsub.schedule(frequency).onRun((context) => {
   return main();
});

'use strict';

const { app, db } = require('./shared/admin');
const { listAllUsers, deleteUser, log } = require('./shared/helpers');
const { getDocument } = require('../functions/shared/helpers');

// whether to make changes in authentication database
const isAction = false;

const main = async () => {
  log('Get all users from authentication database...');
  let users = await listAllUsers();
  log(`Total users: ${users.length}`);

  log('Filter users with email *@justice.gov.uk...');
  const filteredUsers = users.filter(item =>
    item.email.indexOf('@justice.gov.uk') > 0 &&
    item.providerData.length === 1 &&
    item.providerData[0].providerId === 'password'
  );
  log(`Total filtered users: ${filteredUsers.length}`);

  log('Tidy up users...');
  const result = [];
  let count = 0;
  for (let i = 0; i < filteredUsers.length; i++) {
    const user = filteredUsers[i];
    const isCandidate = await getDocument(db.collection('candidates').doc(user.uid));
    if (isCandidate) {
      if (isAction) {
        await deleteUser(user.uid);
      }
      count++;
      result.push(`${count}. ${user.uid}, ${user.email}`);
    }
  }
  log('Tidy up users...done');

  return result;
};

main()
  .then((result) => {
    console.log(result.join('\n'));
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });

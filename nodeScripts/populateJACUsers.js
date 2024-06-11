/*
  This script will populate the JAC users from the authentication database into the users collection
*/

'use strict';

const { app, db, auth } = require('./shared/admin');
const config = require('./shared/config');
const { applyUpdates } = require('../functions/shared/helpers');
const { newUser } = require('../functions/shared/factories')(config);
const { getUserSearchMap } = require('../functions/actions/users')(auth, db);
const { listAllUsers } = require('./shared/helpers');
const { log } = require('./shared/helpers.js');

// whether to make changes in `users` collection in firestore
const isAction = false;

const main = async () => {
  log('Get users from authentication database...');
  const commands = [];
  const users = await listAllUsers();
  log(`- Total users: ${users.length}`);

  log('Filter by JAC users...');
  const filteredUsers = users.filter(user => {
    let isJacAdmin = false;
    if (user.email.match(/(.*@judicialappointments|.*@justice)[.](digital|gov[.]uk)/)) {
      if (user.providerData.length === 1) {
        const provider = user.providerData[0];
        if (provider.providerId === 'google.com' || provider.providerId === 'microsoft.com') {
          isJacAdmin = true; // user has authenticated successfully with google or microsoft
        }
      } else if (user.providerData.length > 1) {
        isJacAdmin = true;
      }
    }

    return isJacAdmin;
  });
  log(`- Total JAC users: ${filteredUsers.length}`);

  filteredUsers.forEach((user) => {
    const userData = newUser(user);
    Object.assign(userData, {
      _search: getUserSearchMap(user),
    });
    commands.push({
      command: 'set',
      ref: db.collection('users').doc(user.uid),
      data: userData,
    });
  });


  if (isAction) {
    log('Create user documents in firestore...');
    const res = await applyUpdates(db, commands);
    log(`- Total created documents: ${res}`);
  }

  log('Done');
};

main()
  .then(() => {
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });

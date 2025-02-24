/*
  This script will populate the JAC users from the authentication database into the users collection
*/

'use strict';

import { app, db, auth } from './shared/admin.js';
import { applyUpdates } from '../functions/shared/helpers.js';
import initFactories from '../functions/shared/factories.js';
import initUsers from '../functions/actions/users.js';
import { listAllUsers } from './shared/helpers.js';
import { log } from './shared/helpers.js';

const { newUser } = initFactories();
const { getUserSearchMap } = initUsers(auth, db);

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

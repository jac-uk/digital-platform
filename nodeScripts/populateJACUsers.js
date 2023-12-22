/*
  This script will populate the JAC users from the authentication database into the users collection
*/

'use strict';

const { app, db } = require('./shared/admin');
const config = require('./shared/config');
const { applyUpdates } = require('../functions/shared/helpers');
const { newUser } = require('../functions/shared/factories')(config);
const { listAllUsers } = require('./shared/helpers');
const { log } = require('./shared/helpers.js');

// whether to make changes in `users` collection in firestore
const isAction = true;

const main = async () => {
  log('Get users from authentication database...');
  const commands = [];
  const users = await listAllUsers();
  log(`- Total users: ${users.length}`);

  log('Filter by JAC users...');
  const filteredUsers = users.filter(item => item.email.match(/(.*@judicialappointments|.*@justice)[.](digital|gov[.]uk)/));
  log(`- Total JAC users: ${filteredUsers.length}`);

  filteredUsers.forEach((user) => {
    commands.push({
      command: 'set',
      ref: db.collection('users').doc(user.uid),
      data: newUser(user),
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

/*
  This script will populate the JAC users from the authentication database into the users collection
*/

'use strict';

const { app, db } = require('./shared/admin');
const config = require('./shared/config');
const { applyUpdates } = require('../functions/shared/helpers');
const { newUser } = require('../functions/shared/factories')(config);
const { listAllUsers } = require('./shared/helpers');

const main = async () => {
  const commands = [];
  const users = await listAllUsers();
  const filteredUsers = users.filter(item => item.email.indexOf('@judicialappointments.') > 0);
  filteredUsers.forEach((user) => {
    commands.push({
      command: 'set',
      ref: db.collection('users').doc(user.uid),
      data: newUser(user),
    });
  });

  if (commands.length) {
    const res = await applyUpdates(db, commands);
    return res;
  }
  return 'No JAC users to update';
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

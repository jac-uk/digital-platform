'use strict';

import { app } from './shared/admin.js';
import { listAllUsers, updateUser, log } from './shared/helpers.js';

// whether to make changes in authentication database
const isAction = false;

const main = async () => {
  log('Get all users from authentication database...');
  let users = await listAllUsers();
  log(`Total users: ${users.length}`);

  log('Filter disabled users with email *@justice.gov.uk...');
  const filteredUsers = users.filter(item =>
    item.email.indexOf('@justice.gov.uk') > 0 &&
    item.disabled &&
    item.providerData.length &&
    item.providerData.some(provider => provider.providerId === 'password')
  );
  log(`Total filtered users: ${filteredUsers.length}`);

  log('Tidy up users...');
  const result = [];
  let count = 0;
  for (let i = 0; i < filteredUsers.length; i++) {
    const user = filteredUsers[i];
    if (isAction) {
      // enable account
      await updateUser(user.uid, { disabled: false });
    }
    count++;
    result.push(`${count}. ${user.uid}, ${user.email}`);
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

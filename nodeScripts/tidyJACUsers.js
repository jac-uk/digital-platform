'use strict';

import { app } from './shared/admin.js';
import { listAllUsers, updateUser, deleteUser, isDevelop } from './shared/helpers.js';

// whether to make changes in authentication database
const isAction = false;

const main = async () => {
  let users = await listAllUsers();

  // filter email ending with @judicialappointments.gov.uk and the provider is only password
  const jacUsers = users.filter(item =>
    item.email.indexOf('@judicialappointments.gov.uk') > 0 &&
    item.providerData.length === 1 &&
    item.providerData[0].providerId === 'password'
  );

  const result = [];
  for (let i = 0; i < jacUsers.length; i++) {
    const user = jacUsers[i];
    const account = user.email.split('@')[0];
    const newEmail = `${account}@judicialappointments.digital`;
    const row = [];
    row.push(user.uid);
    row.push(user.email);
    
    let res = '';
    // check if new email exists
    if (users.some(user => user.email === newEmail)) {
      // *@judicialappointments.digital exists
      // delete user with email *@judicialappointments.gov.uk
      res = isAction ? await deleteUser(user.uid) : '';
      row.push(`delete ${user.email}, ${res}`);
    } else {
      // *@judicialappointments.digital does not exist
      // update user's email with *@judicialappointments.digital
      res = isAction ? await updateUser(user.uid, { email: newEmail }) : '';
      row.push(`update to ${newEmail}, ${res}`);
    }
    result.push(`${i + 1}. ${row.join(', ')}`);
  }

  return result;
};

// only run in develop environment
if (isDevelop()) {
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
}

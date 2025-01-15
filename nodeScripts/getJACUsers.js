'use strict';

import { app } from './shared/admin.js';
import { listAllUsers } from './shared/helpers.js';

const main = async () => {
  let users = await listAllUsers();
  users = users.filter(item => item.email.indexOf('@judicialappointments.') > 0);
  users = users.map((item) => {
    const row = [];
    row.push(item.uid);
    row.push(item.email);
    row.push(item.emailVerified);
    row.push(item.metadata.creationTime);
    row.push(item.metadata.lastSignInTime);
    return row.join(';');
  });
  return 'uid;email;emailVerified;created;lastLogin\n' + users.join('\n');
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

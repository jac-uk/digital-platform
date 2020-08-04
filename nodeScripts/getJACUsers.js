'use strict';

const { app, auth } = require('./shared/admin.js');

// get all google users
async function listAllUsers(nextPageToken) {
  const PAGESIZE = 1000; // up to 1000
  let usersResult;
  if (nextPageToken) {
    usersResult = await auth.listUsers(PAGESIZE, nextPageToken);
  } else {
    usersResult = await auth.listUsers(PAGESIZE);
  }
  let users = usersResult.users;
  if (usersResult.pageToken) {
    const nextPageOfUsers = await listAllUsers(usersResult.pageToken);
    users = users.concat(nextPageOfUsers);
  }
  return users;
}


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

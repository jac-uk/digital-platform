const { auth } = require('./admin');
const { PROJECT_ID } = require('./config');

module.exports = {
  listAllUsers,
  updateUser,
  deleteUser,
  isDevelop,
  log,
};

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

// update user information
async function updateUser(uid, params) {
  try {
    await auth.updateUser(uid, params);
    return 'success';
  } catch (error) {
    return `error: ${JSON.stringify(error.errorInfo)}`;
  }
}

// delete user
async function deleteUser(uid) {
  try {
    await auth.deleteUser(uid);
    return 'success';
  } catch (error) {
    return `error: ${JSON.stringify(error.errorInfo)}`;
  }
}

function isDevelop() {
  return PROJECT_ID.includes('develop');
}

function log(message) {
  const now = new Date();
  console.log(`${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-GB')} - ${message}`);
}

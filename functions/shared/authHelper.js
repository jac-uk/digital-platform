export default (auth) => {

  return {
    listAllUsers,
  };

  async function listAllUsers(users, nextPageToken) {
    // List batch of users, 1000 at a time.
    try {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      users.push(...listUsersResult.users);
      if (listUsersResult.pageToken) {
        // List next batch of users.
        await listAllUsers(users, listUsersResult.pageToken);
      }
    } catch (error) {
      console.log('Error listing users:', error);
    }
  }
};



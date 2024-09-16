export default (auth) => {

  return updateUser;

  /**
   * Update a user
   */
  async function updateUser(userId, data) {
    try {
      await auth.updateUser(userId, data);
      return true;
    } catch(error) {
      console.error('Error updating user:', error);
      return false;
    }
  }
};

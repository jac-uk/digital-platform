export default (auth) => {

  return checkEnabledUserByEmail;

  /**
   * Check if a user of given email address is enabled
   * @param {string} email 
   * @returns 
   */
  async function checkEnabledUserByEmail({ email }) {
    try {
    const user = await auth.getUserByEmail(email);
      return !user.disabled;
    } catch(e) {
      if (e.code === 'auth/user-not-found') {
        return true;
      } else {
        return false;
      }
    }
  }
};

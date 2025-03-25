export default (auth) => {

  return checkSignInMethodsForEmail;

  /**
   * Check if a user of given email address is enabled
   * @param {string} email 
   * @returns 
   */
  async function checkSignInMethodsForEmail({ email }) {
    try {
      const user = await auth.getUserByEmail(email);
      return !user.disabled && user.providerData.length && !!user.providerData.find(provider => provider.providerId === 'password');
    } catch(e) {
      return false;
    }
  }
};

module.exports = (auth) => {

  return updateEmailAddress;

  /**
   * Update candidate login email address
   */
  async function updateEmailAddress(data) {
    const currentEmailAddress = data.currentEmailAddress;
    const newEmailAddress = data.newEmailAddress;

    try {
      const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailRegEx.test(currentEmailAddress) === true && (emailRegEx.test(newEmailAddress) === true)) {
        const user = await auth.getUserByEmail(currentEmailAddress);
        const updatedUser = await auth.updateUser(user.uid, {email: newEmailAddress});
        return updatedUser.email;
      } else {
        return false;
      }
    } catch(e) {
      return false;
    }
  }

};

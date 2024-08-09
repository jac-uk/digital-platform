export default (auth) => {

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
        return {
          status: 'success',
          data: updatedUser,
        };
      } else {
        return {
          status: 'error',
          data: {
            code: 'auth/invalid-email',
            message: 'The email address is badly formatted.',
          },
        };
      }
    } catch(e) {
      return {
        status: 'error',
        data: e.errorInfo,
      };
    }
  }

};

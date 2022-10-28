module.exports = (auth) => {

  return getUserByEmail;

  /**
   * Return candidate's uid, email and name
   * param: EMAIL ADDRESS
   */
  async function getUserByEmail(data) {
    const candidateEmail = data;

    try {
      const user = await auth.getUserByEmail(candidateEmail);
      return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
      };
      }
      catch(e) {
      return false;
    }
  }

};

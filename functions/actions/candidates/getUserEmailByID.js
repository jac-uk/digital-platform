export default (auth) => {

  return getUserEmailByID;

  /**
   * Return candidate's current login email address
   */
  async function getUserEmailByID(data) {
    const candidateId = data.candidateId;

    try {
      const user = await auth.getUser(candidateId);
      return user.email;
      }
      catch(e) {
      return false;
    }
  }

};

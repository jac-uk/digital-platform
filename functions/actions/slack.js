module.exports = (auth, config, db) => {
  const slackWebApi = require('../shared/slackWebApi.js')(config);
  const { updateUser } = require('./users.js')(auth, db);

  return {
    lookupSlackUser,
  };

  /**
   * Check to see if a member id exists in Slack
   * Optionally add the member id to the user profile in firestore
   * 
   * @param {*} bugReportId 
   */
  async function lookupSlackUser(userId, slackMemberId, addSlackIdToUserRecord) {
    const memberExists = await slackWebApi.getUser(slackMemberId);
    if (memberExists && addSlackIdToUserRecord) {
      await updateUser(userId, {
        slackMemberId: slackMemberId,
      });
    }
    return memberExists;
  }
};

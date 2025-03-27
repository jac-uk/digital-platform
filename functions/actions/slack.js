import initSlackWebApi from '../shared/slackWebApi.js';
import initUsers from './users.js';
import initBugReports from './bugReports.js';
import initSendSlackNotifications from './zenhub/sendNewIssueSlackNotifications.js';

export default (auth, db, firebase) => {
  const slackWebApi = initSlackWebApi();
  const { updateUser } = initUsers(auth, db);
  const { getBugReportsWithFailedSendOnCreate } = initBugReports(db, firebase);
  const { sendNewIssueSlackNotifications } = initSendSlackNotifications(db, auth, firebase);

  return {
    lookupSlackUser,
    retrySlackMessageOnCreateIssue,
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

  /**
   * Check for slack messages which were not sent when the bugReport was created and resend them
   * @param {*} slackChannelId
   * @returns
   */
  async function retrySlackMessageOnCreateIssue(slackChannelId) {
    const bugReports = await getBugReportsWithFailedSendOnCreate();
    if (bugReports.length > 0) {
      for (const bugReport of bugReports) {
        const result = await sendNewIssueSlackNotifications(bugReport, slackChannelId);
        return result;
      }
    }
    return true;
  }
};

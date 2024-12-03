import initBugReports from '../../bugReports.js';

export default (config, db, auth, firebase) => {

  const { updateBugReportOnCreate } = initBugReports(db, firebase);

  return {
    onCreatedIssue,
  };

  /**
   * Hook called when an issue is created in github
   * Add key details to the bug report from the issue
   * 
   * @param {object} params 
   * @param {object} bugReport
   * @param {string} slackChannelId
   */
  async function onCreatedIssue(bugReport, issueNumber, issueUrl) {
    await updateBugReportOnCreate(bugReport, issueNumber, issueUrl);
  }
};

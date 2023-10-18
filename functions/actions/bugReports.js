const config = require('../shared/config');

module.exports = (config, firebase, db) => {

  const zenhub = require('../shared/zenhub')(config);
  const slack = require('../shared/slack')(config);

  return {
    onBugReportCreated,
  };

  /**
   * Create an issue in Zenhub
   * Send a message to a Slack channel notifying the team of the bug
   * Update the bugReport collection with the Zenhub Issue ID
   * @param {*} bugReportId 
   * @param {*} data 
   */
  async function onBugReportCreated(bugReportId, data) {
    const issue = data.issue;
    const criticality = data.criticality;
    const reporter = data.reporter;
    let slackMessage = `The following ${criticality} issue was raised by ${reporter}`;
    if (data.exercise.referenceNumber) {
      slackMessage += ` for exercise ${data.exercise.referenceNumber}`;
    }
    slackMessage += `.\nDescription: ${issue}`;
    const zenhubIssueId = await zenhub.createIssue(issue);
    if (zenhubIssueId) {
      await db.doc(`bugReports/${bugReportId}`).update({
        zenhubIssueId: zenhubIssueId,
        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      slackMessage += `\nZenHub Issue ID: ${zenhubIssueId}`;
    }
    else {
      slackMessage += '\n\n*** However there was an error when trying to send it to Zenhub. Please see the digital platform console ***';
    }
    slack.post(slackMessage);
  }

};

import { SLACK_MAX_RETRIES  } from '../shared/config.js';
import { getDocument, getDocuments, applyUpdates } from '../shared/helpers.js';
export default (db, firebase) => {
  return {
    getBugReportById,
    getBugReportByRef,
    getBugReportNumberFromIssueTitle,
    incrementSlackRetries,
    updateBugReportOnSlackSent,
    getBugReportsWithFailedSendOnCreate,
    updateBugReportOnCreate,
  };

  async function getBugReportById(id) {
    return await getDocument(db.collection('bugReports').doc(id));
  }

  async function getBugReportByRef(referenceNumber) {
    const bugReportsRef = db.collection('bugReports').where('referenceNumber', '==', referenceNumber);
    let bugReports = await getDocuments(bugReportsRef);
    if (bugReports.length === 0) {
      return null;
    }
    return bugReports[0];
  }

  /**
   * Extract the bugReport referenceNUmber from the github issue title
   * Checks if the string contains the pattern:
   * BR_<platform>_<2 letter environment>_<number>
   * @param {*} issueTitle 
   * @returns array|null
   */
  function getBugReportNumberFromIssueTitle(issueTitle) {
    const regex = /BR_\w+_\w+_(\d+)/;
    const match = issueTitle.match(regex);
    return match ? match[0] : match;
  }

  /**
   * Get bugReports who have attempted to send at least one (but not the max number allowed) slack message 
   * on creation of a github issue but failed
   * @returns array
   */
  async function getBugReportsWithFailedSendOnCreate() {
    try {
      const MAX_RETRIES = SLACK_MAX_RETRIES ? SLACK_MAX_RETRIES : 3;
      const bugReportsRef = db.collection('bugReports')
        .where('slackMessages.onCreate.retries', '<', MAX_RETRIES)
        .where('slackMessages.onCreate.sentAt', '==', null);
      return await getDocuments(bugReportsRef);
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      return [];
    }
  }

  /**
   * Update the num slack retries based on the action (eg create)
   * This number specifies the number of times we've tried to send the slack msg to notify us that an issue was eg created
   * @param {*} bugReport 
   * @param {*} action 
   * @returns 
   */
  async function incrementSlackRetries(bugReport, action = 'create') {
    const commands = [];
    if (action === 'create') {
      const bugReportAction = 'onCreate';
      let retries = bugReport.slackMessages[bugReportAction].retries;
      const data = bugReport;
      data.slackMessages.onCreate.retries = ++retries;
      const MAX_RETRIES = SLACK_MAX_RETRIES ? SLACK_MAX_RETRIES : 3;
      if (retries < MAX_RETRIES) {
        commands.push({
          command: 'update',
          ref: bugReport.ref,
          data: data,
        });
      }
    }
    if (commands.length) {
      // write to db
      const result = await applyUpdates(db, commands);
      return result;
    }
    return true;
  }

  /**
   * Update the slack retry timestamp based on the action (eg create)
   * This timestamp specifies the time that the slack msg was sent when the issue was eg created
   * @param {*} bugReport 
   * @param {*} action 
   * @returns 
   */
  async function updateBugReportOnSlackSent(bugReport, action = 'create') {
    const commands = [];
    if (action === 'create') {
      const data = bugReport;
      data.slackMessages.onCreate.sentAt = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: bugReport.ref,
        data: data,
      });
    }
    if (commands.length) {
      // write to db
      const result = await applyUpdates(db, commands);
      return result;
    }
    return true;
  }

  /**
   * When a github issue is created update the bugReport with the issue number and url to the issue
   * on github
   * @param {*} bugReport 
   * @param {*} issue 
   * @returns 
   */
  async function updateBugReportOnCreate(bugReport, issueNumber, issueUrl) {
    const commands = [];
    commands.push({
      command: 'update',
      ref: bugReport.ref,
      data: {
        zenhubIssueNumber: issueNumber,
        githubIssueUrl: issueUrl,
        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
    });
    // write to db
    const result = await applyUpdates(db, commands);
    return result;
  }
};

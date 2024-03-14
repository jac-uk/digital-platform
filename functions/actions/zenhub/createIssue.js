module.exports = (config, firebase, db) => {

  const zenhub = require('../../shared/zenhub')(config);
  const { getDocument } = require('../../shared/helpers');

  return {
    createIssue,
  };

  /**
   * Create an issue in Zenhub
   * Update the bugReport collection with the Zenhub Issue ID
   * 
   * @param {*} bugReportId 
   */
  async function createIssue(bugReportId, userId) {
    const user = await getDocument(db.collection('users').doc(userId));
    const bugReport = await getDocument(db.collection('bugReports').doc(bugReportId));

    // Build Zenhub message
    const body = buildZenhubPayload(bugReport, user);

    const label = bugReport.candidate ? 'Apply' : 'Admin';

    // Create issue in Zenhub
    const zenhubIssueId = await zenhub.createGithubIssue(bugReport.referenceNumber, body, label);

    // Update bugReport with Zenhub issue ID in firestore
    if (zenhubIssueId) {
      await db.doc(`bugReports/${bugReportId}`).update({
        zenhubIssueId: zenhubIssueId,
        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  function buildZenhubPayload(data, user) {
    let payload = `The following ${data.criticality} issue was raised by ${data.reporter}`;
    if (data.exercise.referenceNumber) {
      payload += ` for exercise ${data.exercise.referenceNumber}`;
    }
    if (data.exercise.candidate) {
      payload += `\nCandidate: ${data.exercise.candidate}`;
    }
    payload += `.\nCriticality: ${data.criticality}`;
    payload += `.\nDescription: ${data.issue}`;
    payload += `.\nExpectation: ${data.expectation}`;
    payload += `.\nPlatform: ${data.platform}`;
    payload += `.\nEnvironment: ${data.environment}`;
    payload += `.\nBrowser: ${data.browser}`;
    payload += `.\nOS: ${data.os}`;
    payload += `.\nContact Details: ${data.contactDetails}`;
    payload += `.\nUrl: ${data.url}`;
    payload += `.\nCPS Device? ${data.cpsDevice === '0' ? 'No' : 'Yes'}`;
    if (data.screenshot) {
      payload += `.\nScreenshot Link: ${data.screenshot.downloadUrl}`;
      payload += '.\nScreenshot:';

      // Note:The image src below does not work when using localhost
      payload += `.\n<img src='${data.screenshot.downloadUrl}' />`;
    }
    //payload += '.\n<!-- test = { id: 23, name: \'tester\' } -->';
    //payload += `.\n<!-- reporter = { email: '${data.contactDetails}' } -->`;
    //payload += `.\n<!-- { reporter: '${user.slackMemberId}', developer: 'U052NR5U43Z' } -->`;
   
    return payload;
  }

};

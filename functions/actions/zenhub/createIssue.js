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
    // line breaks removed as working fix, TODO add them back in 
    let payload = `The following ${data.criticality} issue was raised by ${data.reporter}`;
    if (data.exercise.referenceNumber) {
      payload += ` for exercise ${data.exercise.referenceNumber} `;
    }
    if (data.exercise.candidate) {
      payload += `Candidate: ${data.exercise.candidate} `;
    }
    payload += `Criticality: ${data.criticality} `;
    payload += `Description: ${data.issue} `;
    payload += `Expectation: ${data.expectation} `;
    payload += `Platform: ${data.platform} `;
    payload += `Environment: ${data.environment} `;
    payload += `Browser: ${data.browser} `;
    payload += `OS: ${data.os} `;
    payload += `Contact Details: ${data.contactDetails} `;
    payload += `Url: ${data.url} `;
    payload += `CPS Device? ${data.cpsDevice === '0' ? 'No' : 'Yes'} `;
    if (data.screenshot) {
      payload += `Screenshot Link: ${data.screenshot.downloadUrl} `;
      payload += 'Screenshot: ';

      // Note:The image src below does not work when using localhost
      payload += `<img src='${data.screenshot.downloadUrl}' /> `;
    }
    //payload += '<!-- test = { id: 23, name: \'tester\' } -->';
    //payload += `<!-- reporter = { email: '${data.contactDetails}' } -->`;
    //payload += `<!-- { reporter: '${user.slackMemberId}', developer: 'U052NR5U43Z' } -->`;
  
    return payload;
  }

};

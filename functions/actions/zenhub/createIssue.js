import initZenhub from '../../shared/zenhub.js';
import { getDocument } from '../../shared/helpers.js';
import initUsers from '../../actions/users.js';

export default (config, firebase, db, auth) => {

  const zenhub = initZenhub(config, db, auth);
  const { getBugRotaUser } = initUsers(auth, db);

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
    const bugRotaUser = await getBugRotaUser();
    const assigneeUserIds = bugRotaUser.id ? [bugRotaUser.id] : [];

    // Build Zenhub message
    const body = buildZenhubPayload(bugReport, user);

    const label = bugReport.candidate ? 'Apply' : 'Admin';

    if (bugReport.type !== 'question') {
      // Create issue in Zenhub
      const zenhubIssueId = await zenhub.createGithubIssue(bugReport.referenceNumber, body, label, bugRotaUser);
  
      // Update bugReport with Zenhub issue ID in firestore
      if (zenhubIssueId) {
        await db.doc(`bugReports/${bugReportId}`).update({
          zenhubIssueId: zenhubIssueId,
          assigneeUserIds,
          lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }   
    }
  }

  function buildZenhubPayload(data, user) {
    // line breaks removed as working fix, TODO add them back in 
    let payload = `The following ${data.criticality} issue was raised by ${data.reporter}`;
    if (data.exercise.referenceNumber) {
      payload += ` for exercise ${data.exercise.referenceNumber} `;
    }
    if (data.exercise.candidate) {
      payload += `<br>Candidate: ${data.exercise.candidate} `;
    }
    payload += `<br><strong>Criticality:</strong> ${data.criticality}`;
    payload += `<br><strong>Description:</strong> ${convertNewlineToBr(data.issue)}`;
    payload += `<br><strong>Expectation:</strong> ${convertNewlineToBr(data.expectation)}`;
    payload += `<br><strong>Platform:</strong> ${data.platform}`;
    payload += `<br><strong>Environment:</strong> ${data.environment}`;
    payload += `<br><strong>Browser:</strong> ${data.browser}`;
    payload += `<br><strong>OS:</strong> ${data.os}`;
    payload += `<br><strong>Contact Details:</strong> ${data.contactDetails}`;
    payload += `<br><strong>Url:</strong> ${data.url} `;
    payload += `<br><strong>CPS Device?</strong> ${data.cpsDevice === '0' ? 'No' : 'Yes'}`;

    const screenshotUrl = getScreenshotUrl(data.environment, data.id);
    if (screenshotUrl) {
      payload += `<br><strong>Screenshot Link:</strong> ${screenshotUrl}`;
      // payload += '<br><strong>Screenshot:</strong>';

      // Note:The image src below does not work when using localhost
      // payload += `<img src='${data.screenshot.downloadUrl}' /> `;
    }
    //payload += '<!-- test = { id: 23, name: \'tester\' } -->';
    //payload += `<!-- reporter = { email: '${data.contactDetails}' } -->`;
    //payload += `<!-- { reporter: '${user.slackMemberId}', developer: 'U052NR5U43Z' } -->`;
  
    return payload;
  }

  function convertNewlineToBr(text) {
    // Strip newline chars from the beginning and end of the string
    const text1 = text.replace(/^[\r\n]+|[\r\n]+$/g, '');

    // Replace newline chars with <br>
    return text1.replace(/[\r\n]+/g, '<br>');
  }

  function getScreenshotUrl(environment, bugReportId) {
    if (environment === 'DEVELOP') {
      return `https://jac-admin-develop--pr2639-feature-2627-improve-gg1s0z6s.web.app/bug-reports/screenshot/${bugReportId}`;
      // return `https://admin-develop.judicialappointments.digital/bug-reports/screenshot/${bugReportId}`;
    } else if (environment === 'STAGING') {
      return `https://admin-staging.judicialappointments.digital/bug-reports/screenshot/${bugReportId}`;
    } else if (environment === 'PRODUCTION') {
      return `https://admin.judicialappointments.digital/bug-reports/screenshot/${bugReportId}`;
    }
    return '';
  }
};

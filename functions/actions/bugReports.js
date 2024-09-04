import { getDocuments } from '@jac-uk/jac-kit/helpers/digitalPlatformHelpers.js';

export default (db) => {
  return {
    getBugReportByRef,
    getBugReportNumberFromIssueTitle,
  };

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
};

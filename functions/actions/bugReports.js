const { getDocuments } = require('../shared/helpers');

module.exports = (db) => {
  return {
    getBugReportByRef,
  };

  async function getBugReportByRef(referenceNumber) {
    const bugReportsRef = db.collection('bugReports').where('referenceNumber', '==', referenceNumber);
    let bugReports = await getDocuments(bugReportsRef);
    if (bugReports.length === 0) {
      return null;
    }
    return bugReports[0];
  }
};

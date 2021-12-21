const { getDocument, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return updateStatuses;

  async function updateStatuses(params) {
    const commands = [];
    for(const application of params.applicationIds) {
      //set the status
      let status = null;
      if (application.score >= params.cutOffScore) {
        status = params.cutOffPassStatus;
      } else {
        status = params.cutOffFailStatus;
      }

      // get existing applicationRecord and add update command to batch
      const command = await updateApplicationRecords(application.applicationId, status);
      if(command) {
        commands.push(command);
      }
    }

    const result = await applyUpdates(db, commands);

    return result ? commands.length : false;

  }
  async function updateApplicationRecords(applicationId, status) {
    const applicationRecord = await getDocument(db.collection('applicationRecords').doc(applicationId));

    // check if applicant has withdrawn or has been rejected as ineligible
    if (applicationRecord.status !== 'rejectedAsIneligible' && applicationRecord.status !== 'withdrewApplication') {
      return {
        command: 'update',
        ref: db.collection('applicationRecords').doc(applicationId),
        data: {
          status: status,
        },
      };
    } else {
      return null;
    }
  }
};

const { getDocument } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return updateStatuses;

  async function updateStatuses(params) {

    let results = 0;

    for(const applicationId of params.applicationIds) {
      await db.collection('applicationRecords').doc(applicationId)
        .update({ status: params.applicationStatus });
      results++;
    }

    return results ? results : false;

  }
};

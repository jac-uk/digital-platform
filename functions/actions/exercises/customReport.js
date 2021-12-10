const { getDocuments } = require('../../shared/helpers');

const _ = require('lodash');

module.exports = (config, firebase, db, auth) => {

  return {
    customReport,
  };

  async function customReport(params, context) {

    let reportRef = db.collection('customReports');

    if(_.get(params, 'columns', null)) {
      //save report
      const report = {
        name: params.name,
        columns: params.columns,
        whereClauses: params.whereClauses,
        users: [context.auth.uid],
      };
      await reportRef.add(report);
    }

    const reports = await getDocuments(reportRef.where('users', 'array-contains', context.auth.uid));

    return reports;

  }

};

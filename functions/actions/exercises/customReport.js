import { getDocuments } from '../../shared/helpers.js';

import _ from 'lodash';

export default (db) => {

  return {
    customReport,
    getColumnUsage,
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

  async function getColumnUsage(orderBy = null) {
    let reportRef = db.collection('customReports');
    const reports = await getDocuments(reportRef);
    const columnCounts = [];
    for (const report of reports) {
      if (Object.prototype.hasOwnProperty.call(report, 'columns')) {
        console.log(report.columns);
        report.columns.forEach((column) => {
          // Count occurrences of each string
          columnCounts[column] = (columnCounts[column] || 0) + 1;
        });
      }
    }
    // Convert the object to an array of [column, count] pairs
    let resultArray = Object.entries(columnCounts); // [['name', 1], ['age', 2], ...]

    // Sort the array based on the specified order
    if (orderBy === 'alphabetical') {
      resultArray.sort(([colA], [colB]) => colA.localeCompare(colB)); // Sort by column name
    } else if (orderBy === 'count') {
      resultArray.sort(([, countA], [, countB]) => countB - countA); // Sort by count (max first)
    }
    return resultArray; // Return the sorted array
  }

};

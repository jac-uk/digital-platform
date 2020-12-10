const { getDocument, getDocuments, getDocumentsFromQueries } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return {
    generateQualifyingTestReport,
    qtReportScoresReport,
    qtReportLookupRank,
  };

  /**
  * generateQualifyingTestReport
  * Iterates through all application records which are part of this test/report
  * @param {*} `reportId` (required) ID of qualifying test report
  */
  async function generateQualifyingTestReport(reportId) {

    // get qualifying test report
    const qualifyingTestReport = await getDocument(db.doc(`qualifyingTestReports/${reportId}`));

    // get application records
    let applicationRecords;
    if (qualifyingTestReport.filters && qualifyingTestReport.filters.jurisdiction) {  // TODO check for any filter rather than just jurisdiction
      const applicationsRef = db.collection('applications')
        .where('exerciseId', '==', qualifyingTestReport.exercise.id)
        .where('jurisdictionPreferences', '==', qualifyingTestReport.filters.jurisdiction)
        .where('status', '==', 'applied')
        .select();
      const applications = await getDocuments(applicationsRef);
      const applicationIds = applications.map(item => item.id);
      const queries = applicationIds.map(applicationId => {
        let query = db.collection('applicationRecords')
          .where('exercise.id', '==', qualifyingTestReport.exercise.id)
          .where('application.id', '==', applicationId);
        qualifyingTestReport.qualifyingTests.forEach(qualifyingTest => {
          query = query.where(`qualifyingTests.${qualifyingTest.id}.hasData`, '==', true);
        });
        query = query.select('application', 'qualifyingTests', 'diversity', 'candidate');
        return query;
      });
      applicationRecords = await getDocumentsFromQueries(queries);
    } else {  // all application records
      let applicationRecordsRef = db.collection('applicationRecords')
        .where('exercise.id', '==', qualifyingTestReport.exercise.id);
      qualifyingTestReport.qualifyingTests.forEach(qualifyingTest => {
        applicationRecordsRef = applicationRecordsRef.where(`qualifyingTests.${qualifyingTest.id}.hasData`, '==', true);
      });
      applicationRecordsRef = applicationRecordsRef.select('application', 'qualifyingTests', 'diversity', 'candidate');
      applicationRecords = await getDocuments(applicationRecordsRef);
    }

    const rawData = qtReportRawData(qualifyingTestReport.qualifyingTests, applicationRecords);
    const lookupRank = qtReportLookupRank(rawData);
    const rawDataWithRank = qtReportRawDataWithRank(rawData, lookupRank);
    const report = qtReportScoresReport(rawData, lookupRank);

    // TODO ?Update applicationRecords with rank?

    // Update qualifyingTestReport with report (and raw data)
    await qualifyingTestReport.ref.update({
      report: report,
      rawData: rawDataWithRank,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return true;
  }

  // qtReportRawData(qualifyingTests, applicationRecords) => [{ application, score, qualifyingTests }] ordered by score desc
  function qtReportRawData(qualifyingTests, applicationRecords) {
    const data = [];
    for (let i = 0, len = applicationRecords.length; i < len; ++i) {
      const applicationRecord = applicationRecords[i];
      const row = {
        score: 0,
        qualifyingTests: {},
      };
      if (applicationRecord.application) {
        row.application = {
          id: applicationRecord.application.id,
          referenceNumber: applicationRecord.application.referenceNumber,
        };
      }
      if (applicationRecord.candidate) {
        row.candidate = {
          fullName: applicationRecord.candidate.fullName,
          // TODO email: applicationRecord.candidate.email,
        };
      }
      if (applicationRecord.diversity) {
        row.diversity = {
          female: applicationRecord.diversity.gender === 'female' ? true : false,
          bame: applicationRecord.diversity.ethnicity === 'bame' ? true : false,
          solicitor: applicationRecord.diversity.professionalBackground.solicitor ? true : false,
          disability: applicationRecord.diversity.disability === true ? true : false,
        };
      }
      qualifyingTests.forEach(qualifyingTest => {
        row.qualifyingTests[qualifyingTest.id] = {};
        row.qualifyingTests[qualifyingTest.id].responseId = applicationRecord.qualifyingTests[qualifyingTest.id].responseId;
        row.qualifyingTests[qualifyingTest.id].score = applicationRecord.qualifyingTests[qualifyingTest.id].score;
        row.qualifyingTests[qualifyingTest.id].status = applicationRecord.qualifyingTests[qualifyingTest.id].status;
        row.score += applicationRecord.qualifyingTests[qualifyingTest.id].score;
      });
      data.push(row);
    }
    return data.sort((a, b) => { return (b.score - a.score); });
  }

  // qtReportLookupRank(rawdata) => { score: rank }
  function qtReportLookupRank(rawData) {
    const lookup = {};
    let currentScore;
    rawData.forEach((row, index) => {
      if (row.score === currentScore) {
        lookup[currentScore].count++;
      } else {
        currentScore = row.score;
        lookup[currentScore] = {
          count: 1,
          rank: index + 1,
        };
      }
    });
    return lookup;
  }

  function qtReportRawDataWithRank(rawData, lookup) {
    rawData.forEach(row => row.rank = lookup[row.score].rank);
    return rawData;
  }

  // qtReportScoresReport(rawData, lookup) => [{ score, count, rank, score diversity, cumulative diversity }]
  function qtReportScoresReport(rawData, lookup) {
    const data = [];
    let diversity = {
      female: 0,
      bame: 0,
      solicitor: 0,
      disability: 0,
    };
    let cumulativeDiversity = {
      female: 0,
      bame: 0,
      solicitor: 0,
      disability: 0,
    };
    for (let i = 0, len = rawData.length; i < len; ++i) {
      const row = rawData[i];
      if (row.diversity) {
        if (row.diversity.female) {
          diversity.female++;
          cumulativeDiversity.female++;
        }
        if (row.diversity.bame) {
          diversity.bame++;
          cumulativeDiversity.bame++;
        }
        if (row.diversity.solicitor) {
          diversity.solicitor++;
          cumulativeDiversity.solicitor++;
        }
        if (row.diversity.disability) {
          diversity.disability++;
          cumulativeDiversity.disability++;
        }
      }
      if (i === len - 1 || rawData[i].score !== rawData[i+1].score) {
        data.push({
          score: row.score,
          count: lookup[row.score].count,
          rank: lookup[row.score].rank,
          diversity: { ...diversity },
          cumulativeDiversity: { ...cumulativeDiversity },
        });
        diversity.female = 0;
        diversity.bame = 0;
        diversity.solicitor = 0;
        diversity.disability = 0;
      }
    }
    return data;
  }

};

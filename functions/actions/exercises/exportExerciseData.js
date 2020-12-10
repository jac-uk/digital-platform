const { getDocument, getDocuments, getAllDocuments, formatDate } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return {
    exportExerciseData,
  };

  /**
  * exportExerciseData
  * Generates an export of all applications in the selected exercises
  * @param {*} `exerciseIds` (required) IDs of exercises to include in the export
  */
  async function exportExerciseData(exerciseIds) {

    // get exercises
    const exerciseRefs = exerciseIds.map(id => db.collection('exercises').doc(id));
    const exercises = await getAllDocuments(db, exerciseRefs);
    // const exercises = await getDocuments(db.collection('exercises'));

    const columns = [
      { title: 'Candidate unique ID ', ref: 'applicationRecord.candidate.id' },
      { title: 'Application unique ID', ref: 'applicationRecord.application.referenceNumber' },
      { title: 'Exercise reference ', ref: 'exercise.referenceNumber' },
      { title: 'Exercise closing date', ref: 'exercise.applicationCloseDate', type: 'date' },
      { title: 'Submitted on', ref: 'application.appliedAt', type: 'datetime' },
      { title: 'Date of birth', ref: 'application.personalDetails.dateOfBirth', type: 'date' },
      { title: 'Agreed to share data', ref: 'application.equalityAndDiversitySurvey.shareData' },
      { title: 'Professional background', ref: 'application.equalityAndDiversitySurvey.professionalBackground', type: 'json' },
      { title: 'Current legal role', ref: 'application.equalityAndDiversitySurvey.currentLegalRole', type: 'json' },
      { title: 'Held fee-paid judicial role', ref: 'application.equalityAndDiversitySurvey.feePaidJudicialRole' },
      { title: 'Attended state or fee-paying school', ref: 'application.equalityAndDiversitySurvey.stateOrFeeSchool' },
      { title: 'Attended Oxbridge universities', ref: 'application.equalityAndDiversitySurvey.oxbridgeUni' },
      { title: 'First generation to go to university', ref: 'application.equalityAndDiversitySurvey.firstGenerationStudent' },
      { title: 'Ethnic group', ref: 'application.equalityAndDiversitySurvey.ethnicGroup' },
      { title: 'Gender', ref: 'application.equalityAndDiversitySurvey.gender' },
      { title: 'Gender is the same as sex assigned at birth', ref: 'application.equalityAndDiversitySurvey.changedGender' },
      { title: 'Sexual orientation', ref: 'application.equalityAndDiversitySurvey.sexualOrientation' },
      { title: 'Disability', ref: 'application.equalityAndDiversitySurvey.disability' },
      { title: 'Religion or faith', ref: 'application.equalityAndDiversitySurvey.religionFaith' },
      { title: 'Attended Outreach events', ref: 'application.equalityAndDiversitySurvey.attendedOutreachEvents' },
      { title: 'Participated in a Judicial Workshadowing Scheme', ref: 'application.equalityAndDiversitySurvey.participatedInJudicialWorkshadowingScheme' },
      { title: 'Participated in Pre-Application Judicial Education programme', ref: 'application.equalityAndDiversitySurvey.hasTakenPAJE' },
      { title: 'Applying for a Welsh post', ref: 'application.applyingForWelshPost' },
      { title: 'Qualification', ref: 'application.qualifications', type: 'json' },
      { title: 'Fee-paid or salaried judge', ref: 'application.feePaidOrSalariedJudge' },
      { title: 'Stage', ref: 'applicationRecord.stage' },
      { title: 'Status', ref: 'applicationRecord.status' },
      { title: 'QT scores ', ref: 'applicationRecord.qualifyingTests', type: 'json' },
    ];

    // get rows for all selected exercises
    let rows = [];
    for (let i = 0, len = exercises.length; i < len; i++) {
      const exercise = exercises[i];
      // get application records & applications
      const applicationRecords = await getDocuments(
        db.collection('applicationRecords')
          .where('exercise.id', '==', exercises[i].id)
      );
      const applications = await getDocuments(
        db.collection('applications')
          .where('exerciseId', '==', exercises[i].id)
      );
      const joinedData = [];
      for (let j = 0, lenJ = applicationRecords.length; j < lenJ; j++) {
        const applicationRecord = applicationRecords[j];
        // const application = await getDocument(db.collection('application').doc(applicationRecord.id));
        const application = applications.find(item => item.id === applicationRecord.id);
        joinedData.push({
          id: applicationRecord.id,
          application: application,
          applicationRecord: applicationRecord,
          exercise: exercise,
        });
      }

      const report = getReport(columns, joinedData);
      rows = rows.concat(report);
    }
    const report = {
      exerciseIds,
      columns,
      rows,
    };
    return report;
  }

  function getReport(columns, rows) {
    const reportData = [];
    rows.forEach(row => {
      const reportRow = {};
      columns.forEach(column => {
        switch(column.type) {
        case 'date':
          reportRow[column.ref] = formatDate(getValueAtObjectPath(row, column.ref));
          break;
        case 'datetime':
          reportRow[column.ref] = formatDate(getValueAtObjectPath(row, column.ref), 'datetime');
          break;
        case 'json':
          reportRow[column.ref] = JSON.stringify(getValueAtObjectPath(row, column.ref));
          break;
        default:
          reportRow[column.ref] = getValueAtObjectPath(row, column.ref);
        }
      });
      reportData.push(reportRow);
    });
    return reportData;
  }

  function getValueAtObjectPath(object, path) {
    if (path && path.indexOf('.') >= 0) {
      let currentPath = path.substring(0, path.indexOf('.'));
      let remainingPath = path.substring(path.indexOf('.') + 1);
      let valueAtPath = object[currentPath];
      while (valueAtPath && remainingPath.indexOf('.') >= 0) {
        currentPath = remainingPath.substring(0, remainingPath.indexOf('.'));
        remainingPath = remainingPath.substring(remainingPath.indexOf('.') + 1);
        valueAtPath = valueAtPath[currentPath];
      }
      if (valueAtPath) {
        valueAtPath = valueAtPath[remainingPath];
      }
      return valueAtPath;
    } else {
      return object[path];
    }
  }

};

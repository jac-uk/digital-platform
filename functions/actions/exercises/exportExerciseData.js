import { getDocuments, getAllDocuments, formatDate } from '../../shared/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import * as applicationHelpers from '../../shared/converters/helpers.js';

export default (config, firebase, db) => {

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
      { title: 'Agreed to share data', ref: 'application.equalityAndDiversitySurvey.shareData', formatter: applicationHelpers.toYesNo },
      { title: 'Professional background', ref: 'application.equalityAndDiversitySurvey.professionalBackground', formatter: formatProfessionalBackground },
      { title: 'Current legal role', ref: 'application.equalityAndDiversitySurvey.currentLegalRole', formatter: { function: applicationHelpers.flattenCurrentLegalRole, ref: 'application.equalityAndDiversitySurvey' } },
      { title: 'Held fee-paid judicial role', ref: 'application.equalityAndDiversitySurvey.feePaidJudicialRole', formatter: applicationHelpers.heldFeePaidJudicialRole },
      { title: '[pre 01/04/2023] Attended state or fee-paying school', ref: 'application.equalityAndDiversitySurvey.stateOrFeeSchool', formatter: lookup },
      { title: 'Attended state or fee-paying school', ref: 'application.equalityAndDiversitySurvey.stateOrFeeSchool16', formatter: lookup },
      { title: '[pre 01/04/2023] Attended Oxbridge universities', ref: 'application.equalityAndDiversitySurvey.oxbridgeUni', formatter: formatYesNoLookup },
      { title: '[pre 01/04/2023] First generation to go to university', ref: 'application.equalityAndDiversitySurvey.firstGenerationStudent', formatter: formatYesNoLookup },
      { title: 'Occupation of main household earner', ref: 'application.equalityAndDiversitySurvey.occupationOfChildhoodEarner', formatter: lookup },
      { title: 'Either parent attended university to gain a degree', ref: 'application.equalityAndDiversitySurvey.parentsAttendedUniversity', formatter: formatYesNoLookup },
      { title: 'Ethnic group', ref: 'application.equalityAndDiversitySurvey.ethnicGroup', formatter: lookup },
      { title: 'Gender', ref: 'application.equalityAndDiversitySurvey.gender', formatter: lookup },
      { title: 'Gender is the same as sex assigned at birth', ref: 'application.equalityAndDiversitySurvey.changedGender', formatter: formatYesNoLookup },
      { title: 'Sexual orientation', ref: 'application.equalityAndDiversitySurvey.sexualOrientation', formatter: lookup },
      { title: 'Disability', ref: 'application.equalityAndDiversitySurvey.disability', formatter: { function: formatDisability, ref: 'application.equalityAndDiversitySurvey' } },
      { title: 'Religion or faith', ref: 'application.equalityAndDiversitySurvey.religionFaith', formatter: lookup },
      { title: 'Attended Outreach events', ref: 'application.equalityAndDiversitySurvey.attendedOutreachEvents', formatter: formatYesNoLookup },
      { title: 'Participated in a Judicial Workshadowing Scheme', ref: 'application.equalityAndDiversitySurvey.participatedInJudicialWorkshadowingScheme', formatter: formatYesNoLookup },
      { title: 'Participated in Pre-Application Judicial Education programme', ref: 'application.equalityAndDiversitySurvey.hasTakenPAJE', formatter: formatYesNoLookup },
      { title: 'Applying for a Welsh post', ref: 'application.applyingForWelshPost', formatter: applicationHelpers.toYesNo },
      { title: 'Qualification', ref: 'application.qualifications', formatter: formatQualifications },
      { title: 'Fee-paid or salaried judge', ref: 'application.feePaidOrSalariedJudge', formatter: { function: formatFeePaidOrSalariedJudge, ref: 'application' } },
      { title: 'Stage', ref: 'applicationRecord.stage', formatter: lookup },
      { title: 'Status', ref: 'applicationRecord.status', formatter: lookup },
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
          .where('status', '!=', 'draft') // excludes any applications in Draft state
      );
      const joinedData = [];
      for (let j = 0, lenJ = applicationRecords.length; j < lenJ; j++) {
        const applicationRecord = applicationRecords[j];
        const application = applications.find(item => item.id === applicationRecord.id) || null;
        if (application) {
          joinedData.push({
            id: applicationRecord.id,
            application: application,
            applicationRecord: applicationRecord,
            exercise: exercise,
          });
        }
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
        if (column.formatter) {
          if (typeof column.formatter === 'function') {
            reportRow[column.ref] = column.formatter(reportRow[column.ref]);
          } else {
            let data = reportRow[column.ref];
            if (column.formatter.ref) { data = getValueAtObjectPath(row, column.formatter.ref); }
            reportRow[column.ref] = column.formatter.function(data);
          }
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

  // Formatters
  function formatProfessionalBackground(value) {
    if (value) {
      return value.map(position => lookup(position)).join(', ');
    }
    return value;
  }
  function formatYesNoLookup(value) {
    return applicationHelpers.toYesNo(lookup(value));
  }
  function formatDisability(equalityAndDiversitySurvey) {
    if (!equalityAndDiversitySurvey) { return equalityAndDiversitySurvey; }
    let data = formatYesNoLookup(equalityAndDiversitySurvey.disability);
    return data;
  }
  function formatQualifications(data) {
    if (data && data.length) {
      return data.map(qualification => {
        return [
          `Qualification Type: ${lookup(qualification.type)}`,
          `Qualification Date: ${formatDate(qualification.date)}`,
          `Qualification Location: ${lookup(qualification.location)}`,
        ].join(', ');
      }).join('\n');
    }
    return '';
  }
  function formatFeePaidOrSalariedJudge(application) {
    if (!application) { return application; }
    let data = formatYesNoLookup(application.feePaidOrSalariedJudge);
    if (application.feePaidOrSalariedJudge === true) { data = `${data} - ${application.feePaidOrSalariedSittingDaysDetails}`; }
    return data;
  }

};

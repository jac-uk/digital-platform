const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments } = require('../../shared/helpers');
const { getDocument } = require('../../shared/helpers');
const _ = require('lodash');
const {formatDate} = require('../../shared/converters/helpers');



module.exports = (firebase, db) => {

  return {
    exportApplicationEligibilityIssues,
  };

  /**
   * exportApplicationEligibilityIssues
   * Generates an export of all applications in the selected exercise with eligibility issues
   * @param {*} `exerciseId` (required) ID of exercise to include in the export
   */
  async function exportApplicationEligibilityIssues(exerciseId) {

    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('flags.eligibilityIssues', '==', true));

    const headers = [
      'Ref',
      'Name',
      'Email',
      'Citizenship',
      'Date of Birth',
      'Qualifications',
      'Post-qualification Experience',
    ];

    for (let i = 0, len = applicationRecords.length; i < len; i++) {
      const applicationRecord = applicationRecords[i];
      //add application records to applicationRecords.application records
      applicationRecords[i].application = await getDocument(
        db.collection('applications')
          .doc(applicationRecord.application.id)
      );
    }
    return {
      headers: headers,
      rows: eligibilityIssuesExport(applicationRecords),
    };
  }
};

const eligibilityIssuesExport = (applicationRecords) => {
  return applicationRecords.map((applicationRecord) => {
    const application = applicationRecord.application;
    return {
      referenceNumber: _.get(applicationRecord, 'application.referenceNumber', null),
      fullName: _.get(applicationRecord,'candidate.fullName', null),
      email: _.get(applicationRecord, 'application.personalDetails.email', null),
      citizenship: _.get(applicationRecord, 'application.personalDetails.citizenship', null),
      dateOfBirth: formatDate(_.get(applicationRecord, 'application.personalDetails.dateOfBirth', null)),
      qualifications: formatQualifications(_.get(applicationRecord, 'application.qualifications', null)),
      postQualificationExperience: getPostQualificationExperienceString(application),
    };
  });
};

function formatQualifications(data) {
  if (data && data.length) {
    return data.map(qualification => {
      return [
        `${lookup(qualification.type)}`,
        `Date: ${formatDate(qualification.date)}`,
        `Location: ${lookup(qualification.location)}`,
      ].join(' - ');
    }).join('; \n');
  }
  return data;
}

function getPostQualificationExperienceString(application)
{
  if (!application.experience || application.experience.length === 0 ) {
    return '';
  } else {
    return application.experience.map((job) => {
      if (job.jobTitle) {
        return formatDate(job.startDate) + ' - ' + job.jobTitle + ' at ' + job.orgBusinessName;
      } else {
        return '';
      }
    }).join('\r\n\r\n\r\n').trim();
  }
}

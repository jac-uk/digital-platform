const lookup = require('../../shared/converters/lookup');
const helpers = require('../../shared/converters/helpers');
const { getDocuments, getDocument, formatDate } = require('../../shared/helpers');
const _ = require('lodash');

module.exports = (firebase, db) => {
  return {
    exportApplicationCharacterIssues,
  };

  async function exportApplicationCharacterIssues(exerciseId, stage, status) {

    // get applicationRecords
    let firestoreRef = db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('flags.characterIssues', '==', true);
    if (stage !== 'all') {
      firestoreRef = firestoreRef.where('stage', '==', stage);
    }
    if (status !== 'all') {
      firestoreRef = firestoreRef.where('status', '==', status);
    } else {
      firestoreRef = firestoreRef.where('status', '!=', 'withdrewApplication');
    }
    const applicationRecords = await getDocuments(firestoreRef);

    // add applications
    for (let i = 0, len = applicationRecords.length; i < len; i++) {
      const applicationRecord = applicationRecords[i];
      applicationRecords[i].application = await getDocument(
        db.collection('applications').doc(applicationRecord.application.id)
      );
    }

    // return data for export
    return {
      total: applicationRecords.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      headers: getHeaders(),
      rows: getRows(applicationRecords),
    };

  }

  function getHeaders() {
    return [
      { title: 'Ref', name: 'ref' },
      { title: 'Name', name: 'name' },
      { title: 'Email', name: 'email' },
      { title: 'Phone', name: 'phone' },
      { title: 'Date of Birth', name: 'dob' },
      { title: 'NI Number', name: 'nationalInsuranceNumber' },
      { title: 'Citizenship', name: 'citizenship '},
      { title: 'Reasonable Adjustments', name: 'reasonableAdjustments' },
      { title: 'Character Information', name: 'characterInformation' },
      { title: 'Agreed to share data', name: 'shareData' },
      { title: 'Professional background', name: 'professionalBackground' },
      { title: 'Current legal role', name: 'currentLegalRole' },
      { title: 'Held fee-paid judicial role', name: 'feePaidJudicialRole' },
      { title: 'Attended state or fee-paying school', name: 'stateOrFeeSchool' },
      { title: 'Attended Oxbridge universities', name: 'oxbridgeUni' },
      { title: 'First generation to go to university', name: 'firstGenerationStudent' },
      { title: 'Ethnic group', name: 'ethnicGroup' },
      { title: 'Gender', name: 'gender' },
      { title: 'Gender is the same as sex assigned at birth', name: 'changedGender' },
      { title: 'Sexual orientation', name: 'sexualOrientation' },
      { title: 'Disability', name: 'disability' },
      { title: 'Religion or faith', name: 'religionFaith' },
      { title: 'Attended Outreach events', name: 'attendedOutreachEvents'},
      { title: 'Participated in a Judicial Workshadowing Scheme', name: 'participatedInJudicialWorkshadowingScheme' },
      { title: 'Participated in Pre-Application Judicial Education programme', name: 'hasTakenPAJE' },
      { title: 'Location Preferences', name: 'locationPreferences' },
      { title: 'Jurisdiction Preferences', name: 'jurisdictionPreferences' },
      { title: 'Qualifications', name: 'qualifications' },
      { title: 'Post-qualification Experience', name: 'postQualificationExperience' },
      { title: 'Judicial Experience', name: 'judicialExperience' },
    ];
  }

  function getRows(applicationRecords) {
    return applicationRecords.map((applicationRecord) => {
      const application = applicationRecord.application;

      return {
        ref: _.get(applicationRecord, 'application.referenceNumber', ''),
        name: _.get(applicationRecord,'candidate.fullName', ''),
        email: _.get(applicationRecord, 'application.personalDetails.email', ''),
        phone: _.get(applicationRecord, 'application.personalDetails.phone', ''),
        dob: formatDate(_.get(applicationRecord, 'application.personalDetails.dateOfBirth', '')),
        nationalInsuranceNumber: _.get(applicationRecord, 'application.personalDetails.nationalInsuranceNumber', ''),
        citizenship: _.get(applicationRecord, 'application.personalDetails.citizenship', ''),
        reasonableAdjustments: _.get(applicationRecord, 'application.personalDetails.reasonableAdjustmentsDetails', ''),
        characterInformation: getCharacterInformationString(applicationRecord, application),
        ...getEqualityAndDiversityData(application),
        locationPreferences: getLocationPreferencesString(application),
        jurisdictionPreferences: getJurisdictionPreferencesString(application),
        qualifications: getQualificationInformationString(application),
        postQualificationExperience: getPostQualificationExperienceString(application),
        judicialExperience: getJudicialExperienceString(application),
      };
    });
  }

  function getEqualityAndDiversityData (application) {
    const survey = application.equalityAndDiversitySurvey;

    let formattedFeePaidJudicialRole;
    if (survey.shareData) {
      formattedFeePaidJudicialRole = helpers.toYesNo(lookup(survey.feePaidJudicialRole));
      if (survey.feePaidJudicialRole === 'other-fee-paid-judicial-office') {
        formattedFeePaidJudicialRole = `${formattedFeePaidJudicialRole}\n${survey.otherFeePaidJudicialRoleDetails}`;
      }
    }

    const formattedDiversityData = {
      shareData: helpers.toYesNo(survey.shareData),
      professionalBackground: helpers.flattenProfessionalBackground(application.equalityAndDiversitySurvey),
      currentLegalRole: helpers.flattenCurrentLegalRole(application.equalityAndDiversitySurvey),
      formattedFeePaidJudicialRole: formattedFeePaidJudicialRole || null,
      stateOrFeeSchool: lookup(survey.stateOrFeeSchool),
      oxbridgeUni: helpers.toYesNo(survey.oxbridgeUni),
      firstGenerationStudent: helpers.toYesNo(lookup(survey.firstGenerationStudent)),
      ethnicGroup: lookup(survey.ethnicGroup),
      gender: lookup(survey.gender),
      changedGender: helpers.toYesNo(survey.changedGender),
      sexualOrientation: lookup(survey.sexualOrientation),
      disability: survey.disability ? survey.disabilityDetails : helpers.toYesNo(survey.disability),
      religionFaith: lookup(survey.religionFaith),
      attendedOutreachEvents : helpers.toYesNo(lookup(survey.attendedOutreachEvents)),
      participatedInJudicialWorkshadowingScheme : 'No', // default (see below)
      hasTakenPAJE : 'No', // default (see below)
    };

    if (this.exerciseType === 'legal' || this.exerciseType === 'leadership') {
      formattedDiversityData.participatedInJudicialWorkshadowingScheme = helpers.toYesNo(lookup(survey.participatedInJudicialWorkshadowingScheme));
      formattedDiversityData.hasTakenPAJE = helpers.toYesNo(lookup(survey.hasTakenPAJE));
    }

    return formattedDiversityData;
  }

  function getLocationPreferencesString(application)
  {
    if (!application.locationPreferences) {
      return '';
    }
    if (Array.isArray(application.locationPreferences)) {
      return application.locationPreferences.join('\r\n');
    }
    return application.locationPreferences;
  }

  function getJurisdictionPreferencesString(application)
  {
    if (!application.jurisdictionPreferences) {
      return '';
    }
    if (Array.isArray(application.jurisdictionPreferences)) {
      return application.jurisdictionPreferences.join('\r\n');
    }
    return application.jurisdictionPreferences;
  }

  function getQualificationInformationString(application)
  {
    if (!application.qualifications || application.qualifications.length === 0) {
      return '';
    }
    return application.qualifications.map(qualification => {
      if (typeof qualification.type === 'undefined' || typeof qualification.data === 'undefined') {
        return '';
      }
      let description = `${qualification.type.toUpperCase()} - ${formatDate(qualification.date)}\r\n`;
      if (qualification.location) {
        description = description + qualification.location.replace('-', '/').toUpperCase() + '\r\n';
      }
      if (qualification.calledToBarDate) {
        description = description + `Called to the bar: ${formatDate(qualification.calledToBarDate)}\r\n`;
      }
      if (qualification.details) {
        description = description + `${qualification.details}\r\n`;
      }
      return description;
    }).join('\r\n\r\n\r\n').trim();
  }

  function getCharacterInformationString(applicationRecord, application) {
    if (!application.progress || !application.progress.characterInformation) {
      return ''; //If they haven't completed the section, skip it in the report.
    }
    if (!application.characterInformation && !application.characterInformationV2) {
      return '';
    }

    return applicationRecord.issues.characterIssues.map((issue) => {
      if (!issue.events || issue.events.length === 0) {
        return '';
      }
      return issue.events.map((event) => {
        return `${issue.summary.toUpperCase()}\r\n${swapDY(formatDate(event.date))} - ${event.title || ''}\r\n${event.details}`;
      }).join('\r\n\r\n\r\n').trim(); //Each separate section should have space in the cell between them.
    }).join('\r\n\r\n\r\n').trim(); //Each separate section should have space in the cell between them.
  }

  function swapDY(d) {
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

  function getJudicialExperienceString(application)
  {
    if (application.feePaidOrSalariedJudge) {
      return `Fee paid or salaried judge\n${lookup(application.feePaidOrSalariedSittingDaysDetails)}`;
    } else if (application.declaredAppointmentInQuasiJudicialBody) {
      return `Quasi-judicial body\n${lookup(application.quasiJudicialSittingDaysDetails)}`;
    } else {
      return `Acquired skills in other way\n${lookup(application.skillsAquisitionDetails)}`;
    }
  }
};

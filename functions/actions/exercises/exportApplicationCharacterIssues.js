const lookup = require('../../shared/converters/lookup');
const helpers = require('../../shared/converters/helpers');
const { getDocuments, getDocument, formatDate } = require('../../shared/helpers');
const _ = require('lodash');
const htmlWriter = require('../../shared/htmlWriter');
const config = require('../../shared/config');
const drive = require('../../shared/google-drive')();

module.exports = (firebase, db) => {
  return {
    exportApplicationCharacterIssues,
  };

  async function exportApplicationCharacterIssues(exerciseId, stage, status, format) {

    // get the exercise
    const exercise = await getDocument(
      db.collection('exercises').doc(exerciseId)
    );

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

    // generate the export (to Google Doc)
    if (format === 'googledoc') {
      return exportToGoogleDoc(exercise, applicationRecords);
    }

    // return data for export (to Excel)
    return {
      total: applicationRecords.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      headers: getHeaders(),
      rows: getRows(applicationRecords),
    };

  }

  /**
   * Exports character issues to a Google Docs file
   *
   * @param {*} applicationRecords
   * @returns
   */
  async function exportToGoogleDoc(exercise, applicationRecords) {

    // get drive service
    await drive.login();

    // get settings and apply them
    const settings = await getDocument(db.collection('settings').doc('services'));
    drive.setDriveId(settings.google.driveId);

    // generate a filename for the document we are going to create
    const timestamp = (new Date()).toISOString();
    const filename = exercise.referenceNumber + '_' + timestamp;

    // make sure a destination folder exists to create the file in
    const folderName = 'Character Export';
    const folders = await drive.listFolders();
    let folderId = 0;
    folders.forEach((v, i) => {
      if (v.name === folderName) {
        folderId = v.id;
      }
    });
    if (folderId === 0) { // folder doesn't exist so create it
      folderId = await drive.createFolder(folderName);
    }

    // Create character issues document
    await drive.createFile(filename, {
      folderId: folderId,
      sourceType: drive.MIME_TYPE.HTML,
      sourceContent: getHtmlCharacterIssues(exercise, applicationRecords),
      destinationType: drive.MIME_TYPE.DOCUMENT,
    });

    // return the path of the file to the caller
    return {
      path: folderName + '/' + filename,
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
    if (!survey) return {};

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

  function getQualificationInformationString(application) {
    if (!application.qualifications) return '';
    if (!application.qualifications.length) return '';

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

  function getHtmlCharacterIssues(exercise, applicationRecords) {

    let writer = new htmlWriter();
    let firstStatusIsDone = false;

    Object.keys(config.APPLICATION.CHARACTER_ISSUE_STATUS).forEach((k) => {

      const currentStatus = config.APPLICATION.CHARACTER_ISSUE_STATUS[k];

      const statusText = k.split('_').join(' '); // i.e. REJECT_NON_DECLARATION becomes REJECT NON DECLARATION

      if (firstStatusIsDone) {
        writer.addRaw('<br><br><hr><br>');
      }

      writer.addHeading('OFFICIAL - SENSITIVE', 'center', '1rem', 'margin-bottom:10px');
      writer.addHeading(exercise.referenceNumber + ' - CHARACTER ISSUES REQUIRING A DECISION: ' + statusText, 'center', '1rem');

      writer.addRaw(`
<table style="font-size: 0.75rem;">
  <tbody>
    <tr><td width="50"><b>No.</b></td><td colspan="2" style="text-align:center;"><b>Detail</b></td></tr>
      `);

      let issueCount = 0;
      applicationRecords.forEach((applicationRecord, i) => {
        if (applicationRecord.issues && applicationRecord.issues.characterIssues && applicationRecord.issues.characterIssues.length > 0) {
          applicationRecord.issues.characterIssues.forEach((characterIssue, i) => {
            if (characterIssue.status && characterIssue.status === currentStatus) {
              issueCount++;
              writer.addRaw(`
    <tr><td rowspan="6" width="50"><b>${issueCount}.</b></td><td width="175"><b>Name</b></td><td>${applicationRecord.candidate.fullName}</td></tr>
    <tr><td><b>Nature and date of issue</b></td><td></td></tr>
    <tr><td><b>Declaration</b></td><td></td></tr>
    <tr><td><b>Recommendation</b></td><td>${statusText}</td></tr>
    <tr><td><b>Guidance reference</b></td><td></td></tr>
    <tr><td><b>Reason for recommendation</b></td><td></td></tr>
              `);
              // const html = converter.getHtmlCharacterIssue(applicationRecord, characterIssue);
              // writer.addRaw(html);
            }
          });
        }
      });

      writer.addRaw(`
  </tbody>
</table>
      `);

      firstStatusIsDone = true;

    });

    return writer.toString();

  }

};

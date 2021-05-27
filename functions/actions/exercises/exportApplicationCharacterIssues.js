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
        characterInformation: getCharacterInformationString(application),
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
    const share = (value) => survey.shareData ? value : null;

    let formattedFeePaidJudicialRole;
    if (survey.shareData) {
      formattedFeePaidJudicialRole = helpers.toYesNo(lookup(survey.feePaidJudicialRole));
      if (survey.feePaidJudicialRole === 'other-fee-paid-judicial-office') {
        formattedFeePaidJudicialRole = `${formattedFeePaidJudicialRole}\n${survey.otherFeePaidJudicialRoleDetails}`;
      }
    }

    const formattedDiversityData = {
      shareData: helpers.toYesNo(survey.shareData),
      professionalBackground: share(survey.professionalBackground.map(position => lookup(position)).join(', ')),
      formattedFeePaidJudicialRole: formattedFeePaidJudicialRole || null,
      stateOrFeeSchool: share(lookup(survey.stateOrFeeSchool)),
      firstGenerationStudent: share(helpers.toYesNo(lookup(survey.firstGenerationStudent))),
      ethnicGroup: share(lookup(survey.ethnicGroup)),
      gender: share(lookup(survey.gender)),
      sexualOrientation: share(lookup(survey.sexualOrientation)),
      disability: share(survey.disability ? survey.disabilityDetails : helpers.toYesNo(survey.disability)),
      religionFaith: share(lookup(survey.religionFaith)),
      attendedOutreachEvents : share(helpers.toYesNo(lookup(survey.attendedOutreachEvents))),
    };

    if (this.exerciseType === 'legal' || this.exerciseType === 'leadership') {
      formattedDiversityData.participatedInJudicialWorkshadowingScheme = share(helpers.toYesNo(lookup(survey.participatedInJudicialWorkshadowingScheme)));
      formattedDiversityData.hasTakenPAJE = share(helpers.toYesNo(lookup(survey.hasTakenPAJE)));
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

  function getCharacterInformationString(application) {
    if (!application.progress || !application.progress.characterInformation) {
      return ''; //If they haven't completed the section, skip it in the report.
    }
    let characterInfo = []; //Array - we'll join with line breaks as we return this information.
    if (!application.characterInformation && !application.characterInformationV2) {
      return '';
    }
    const info = application.characterInformationV2 || application.characterInformation;
    if (info.bankruptcies) {
      characterInfo.push(condenseOffenceDetails(info.bankruptcyDetails, 'Bankruptcies'));
    }
    if (info.complaintOrDisciplinaryAction) {
      characterInfo.push(condenseOffenceDetails(info.complaintOrDisciplinaryActionDetails, 'Complaints or Disciplinary Actions'));
    }
    if (info.criminalCautions) {
      characterInfo.push(condenseOffenceDetails(info.criminalCautionDetails, 'Criminal Cautions'));
    }
    if (info.criminalConvictions) {
      characterInfo.push(condenseOffenceDetails(info.criminalConvictionDetails, 'Criminal Convictions'));
    }
    if (info.criminalOffences) {
      characterInfo.push(condenseOffenceDetails(info.criminalOffenceDetails, 'Criminal Offences'));
    }
    if (info.declaredBankruptOrIVA) {
      characterInfo.push(condenseOffenceDetails(info.declaredBankruptOrIVADetails, 'Declared Bankrupt or IVA'));
    }
    if (info.diciplinaryActionOrAskedToResign) {
      characterInfo.push(condenseOffenceDetails(info.diciplinaryActionOrAskedToResignDetails, 'Disciplinary Action or Asked to Resign'));
    }
    if (info.drivingDisqualifications) {
      characterInfo.push(condenseOffenceDetails(info.drivingDisqualificationDetails, 'Driving Disqualifications'));
    }
    if (info.drivingDisqualificationDrinkDrugs) {
      characterInfo.push(condenseOffenceDetails(info.drivingDisqualificationDrinkDrugsDetails, 'Driving Disqualifications - Drink Or Drugs'));
    }
    if (info.endorsementsOrMotoringFixedPenalties) {
      characterInfo.push(condenseOffenceDetails(info.endorsementsOrMotoringFixedPenaltiesDetails, 'Endorsements or Motoring Fixed Penalties'));
    }
    if (info.fixedPenalties) {
      characterInfo.push(condenseOffenceDetails(info.fixedPenaltyDetails, 'Fixed Penalties'));
    }
    if (info.hmrcFines) {
      characterInfo.push(condenseOffenceDetails(info.hmrcFineDetails, 'HMRC Fines'));
    }
    if (info.involvedInProfessionalMisconduct) {
      characterInfo.push(condenseOffenceDetails(info.involvedInProfessionalMisconductDetails, 'Involved in Professional Misconduct'));
    }
    if (info.ivas) {
      characterInfo.push(condenseOffenceDetails(info.ivaDetails, 'IVAs'));
    }
    if (info.lateTaxReturns) {
      characterInfo.push(condenseOffenceDetails(info.lateTaxReturnDetails, 'Late Tax Returns'));
    }
    if (info.lateTaxReturnOrFined) {
      characterInfo.push(condenseOffenceDetails(info.lateTaxReturnOrFinedDetails, 'Late Tax Returns Or Fines'));
    }
    if (info.lateVatReturns) {
      characterInfo.push(condenseOffenceDetails(info.lateVatReturnDetails, 'Late VAT Returns'));
    }
    if (info.nonMotoringFixedPenaltyNotices) {
      characterInfo.push(condenseOffenceDetails(info.nonMotoringFixedPenaltyNoticesDetails, 'Non Motoring Fixed Penalty Notices'));
    }
    if (info.recentDrivingConvictions) {
      characterInfo.push(condenseOffenceDetails(info.recentDrivingConvictionDetails, 'Recent Driving Convictions'));
    }
    if (info.requestedToResign) {
      characterInfo.push(condenseOffenceDetails(info.requestedToResignDetails, 'Requested to Resign'));
    }
    if (info.subjectOfAllegationOrClaimOfDiscriminationProceeding) {
      characterInfo.push(condenseOffenceDetails(
        info.subjectOfAllegationOrClaimOfDiscriminationProceedingDetails,
        'Subject of Allegation or Claim of Discrimination'
      ));
    }
    if (info.subjectOfAllegationOrClaimOfHarassmentProceeding) {
      characterInfo.push(condenseOffenceDetails(
        info.subjectOfAllegationOrClaimOfHarassmentProceedingDetails,
        'Subject of Allegation or Claim of Harassment'
      ));
    }
    if (info.subjectOfAllegationOrClaimOfNegligence) {
      characterInfo.push(condenseOffenceDetails(
        info.subjectOfAllegationOrClaimOfNegligenceDetails,
        'Subject of Allegation or Claim of Negligence'
      ));
    }
    if (info.subjectOfAllegationOrClaimOfProfessionalMisconduct) {
      characterInfo.push(condenseOffenceDetails(
        info.subjectOfAllegationOrClaimOfProfessionalMisconductDetails,
        'Subject of Allegation or Claim of Professional Misconduct'
      ));
    }
    if (info.subjectOfAllegationOrClaimOfWrongfulDismissal) {
      characterInfo.push(condenseOffenceDetails(
        info.subjectOfAllegationOrClaimOfWrongfulDismissalDetails,
        'Subject of Allegation or Claim of Wrongful Dismissal'
      ));
    }

    if (info.otherCharacterIssues) {
      characterInfo.push(condenseOffenceDetails(info.otherCharacterIssuesDetails, 'Other Character Issues'));
    }
    if (info.furtherInformation) {
      characterInfo.push(condenseOffenceDetails(info.furtherInformationDetails, 'Further Information'));
    }
    return characterInfo.filter(Boolean).join('\r\n\r\n\r\n'); //Each separate section should have space in the cell between them.
  }

  function condenseOffenceDetails(details, title) {
    //Join the offence details into 'date - title <br> details <br><br>date - title <br>....'...etc
    const offences = details.filter(Boolean).filter(d => (typeof d.details !== 'undefined')).map(detail => (`${formatDate(detail.date)}${typeof detail.title !== 'undefined' ? ` - ${detail.title}` : ''}\r\n${detail.details}`)).join('\r\n\r\n');
    if (offences.length === 0) {
      return false;
    }
    return `${title.toUpperCase()}\r\n${offences}`;
  }

  function getPostQualificationExperienceString(application)
  {
    if (!application.experience || application.experience.length === 0 ) {
      return '';
    } else {
      return application.experience.map((job) => {
        return formatDate(job.startDate) + ' - ' + job.jobTitle + ' at ' + job.orgBusinessName;
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

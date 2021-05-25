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
    }).join('\r\n\r\n\r\n');
  }

  function getHeaders() {
    return [
      {title: 'Ref', name: 'ref'},
      {title: 'Name', name: 'name'},
      {title: 'Email', name: 'email'},
      {title: 'Citizenship', name: 'citizenship'},
      {title: 'Date of Birth', name: 'dob'},
      {title: 'Qualifications', name: 'qualifications'},
      {title: 'Character', name: 'character'},
    ];
  }

  function getRows(applicationRecords) {
    return applicationRecords.map((applicationRecord) => {
      const application = applicationRecord.application;
      return {
        ref: _.get(applicationRecord, 'application.referenceNumber', ''),
        name: _.get(applicationRecord,'candidate.fullName', ''),
        email: _.get(applicationRecord, 'application.personalDetails.email', ''),
        citizenship: _.get(applicationRecord, 'application.personalDetails.citizenship', ''),
        dob: formatDate(_.get(applicationRecord, 'application.personalDetails.dateOfBirth', '')),
        qualifications: getQualificationInformationString(application),
        character: getCharacterInformationString(application),
      };
    });
  }
};

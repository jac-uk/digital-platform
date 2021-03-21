const functions = require('firebase-functions');

module.exports = {
  APPLY_URL: functions.config().apply.url,
  APPLICATION: {
    CHARACTER_ISSUES: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      criminalOffences: {
        title: 'Criminal Offences',
        details: 'criminalOffenceDetails',
      },
      declaredBankruptOrIVA: {
        title: 'Declared Bankrupt Or IVA',
        details: 'declaredBankruptOrIVADetails',
      },
      diciplinaryActionOrAskedToResign: {
        title: 'Disciplinary Action Or Asked To Resign',
        details: 'diciplinaryActionOrAskedToResignDetails',
      },
      drivingDisqualificationDrinkDrugs: {
        title: 'Driving Disqualification Drink Drugs',
        details: 'drivingDisqualificationDrinkDrugsDetails',
      },
      endorsementsOrMotoringFixedPenalties: {
        title: 'Endorsements Or Motoring Fixed Penalties',
        details: 'endorsementsOrMotoringFixedPenaltiesDetails',
      },
      involvedInProfessionalMisconduct: {
        title: 'Involved In Professional Misconduct',
        details: 'involvedInProfessionalMisconductDetails',
      },
      lateTaxReturnOrFined: {
        title: 'Late Tax Return Or Fined',
        details: 'lateTaxReturnOrFinedDetails',
      },
      nonMotoringFixedPenaltyNotices: {
        title: 'Non Motoring Fixed Penalty Notices',
        details: 'nonMotoringFixedPenaltyNoticesDetails',
      },
      otherCharacterIssues: {
        title: 'Other Character Issues',
        details: 'otherCharacterIssuesDetails',
      },
    },
    CHARACTER_ISSUES_V2: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      bankruptcies: {
        title: 'Bankruptcies',
        details: 'bankruptcyDetails',
      },
      complaintOrDiciplinaryAction: {
        title: 'Complaint Or Diciplinary Action',
        details: 'complaintOrDiciplinaryActionDetails',
      },
      criminalCautions: {
        title: 'criminal Cautions',
        details: 'criminalCautionsDetails',
      },
      criminalConvictions: {
        title: 'criminal Convictions',
        details: 'criminalConvictionDetails',
      },
      criminalOffences: {
        title: 'Criminal Offences',
        details: 'criminalOffenceDetails',
      },
      declaredBankruptOrIVA: {
        title: 'Declared Bankrupt Or IVA',
        details: 'declaredBankruptOrIVADetails',
      },
      diciplinaryActionOrAskedToResign: {
        title: 'Disciplinary Action Or Asked To Resign',
        details: 'diciplinaryActionOrAskedToResignDetails',
      },
      drivingDisqualifications: {
        title: 'Driving Disqualifications',
        details: 'drivingDisqualificationDetails',
      },
      drivingDisqualificationDrinkDrugs: {
        title: 'Driving Disqualification Drink Drugs',
        details: 'drivingDisqualificationDrinkDrugsDetails',
      },
      endorsementsOrMotoringFixedPenalties: {
        title: 'Endorsements Or Motoring Fixed Penalties',
        details: 'endorsementsOrMotoringFixedPenaltiesDetails',
      },
      fixedPenalties: {
        title: 'Fixed Penalties',
        details: 'fixedPenaltiesDetails',
      },
      furtherInformation: {
        title: 'Further Information',
        details: 'furtherInformationDetails',
      },
      hmrcFines: {
        title: 'HMRC Fines',
        details: 'hmrcFinenDetails',
      },
      involvedInProfessionalMisconduct: {
        title: 'Involved In Professional Misconduct',
        details: 'involvedInProfessionalMisconductDetails',
      },
      ivas: {
        title: 'IVAs',
        details: 'ivaDetails',
      },
      lateTaxReturns: {
        title: 'Late Tax Returns',
        details: 'lateTaxReturnDetails',
      },
      lateTaxReturnOrFined: {
        title: 'Late Tax Return Or Fined',
        details: 'lateTaxReturnOrFinedDetails',
      },
      lateVatxReturns: {
        title: 'Late VAT Returns',
        details: 'lateVatReturnDetails',
      },
      nonMotoringFixedPenaltyNotices: {
        title: 'Non Motoring Fixed Penalty Notices',
        details: 'nonMotoringFixedPenaltyNoticesDetails',
      },
      otherCharacterIssues: {
        title: 'Other Character Issues',
        details: 'otherCharacterIssuesDetails',
      },
      recentDrivingConvictions: {
        title: 'Recent Driving Convictions',
        details: 'recentDrivingConvictionDetails',
      },
      requestedToResign: {
        title: 'Requested To Resign',
        details: 'requestedToResignDetails',
      },
      subjectOfAllegationOrClaimOfDiscriminationProceeding: {
        title: 'Subject Of Allegation Or Claim Of Discrimination Proceeding',
        details: 'subjectOfAllegationOrClaimOfDiscriminationProceedingDetails',
      },
      subjectOfAllegationOrClaimOfHarassmentProceeding: {
        title: 'Subject Of Allegation Or Claim Of Harassment Proceeding',
        details: 'subjectOfAllegationOrClaimOfHarassmentProceedingDetails',
      },
      subjectOfAllegationOrClaimOfNegligence: {
        title: 'Subject Of Allegation Or Claim Of Negligence',
        details: 'subjectOfAllegationOrClaimOfNegligenceDetails',
      },
      subjectOfAllegationOrClaimOfProfessionalMisconduct: {
        title: 'Subject Of Allegation Or Claim Of Professional Misconduct',
        details: 'subjectOfAllegationOrClaimOfProfessionalMisconductDetails',
      },
      subjectOfAllegationOrClaimOfWrongfulDismissal: {
        title: 'Subject Of Allegation Or Claim Of Wrongful Dismissal',
        details: 'subjectOfAllegationOrClaimOfWrongfulDismissalDetails',
      },
    },
  },
  ASSESSMENTS_URL: functions.config().assessments.url,
  ASSESSMENT_TYPE: {
    COMPETENCY: 'competency',
    SKILLS: 'skills',
    GENERAL: 'general',
  },
  QUALIFYING_TEST: {
    TYPE: {
      SCENARIO: 'scenario',
      CRITICAL_ANALYSIS: 'critical-analysis',
      SITUATIONAL_JUDGEMENT: 'situational-judgement',
    },
    MODE: {
      DRY_RUN: 'dry-run',
      MOP_UP: 'mop-up',
    },
    STATUS: {
      CREATED: 'created',
      SUBMITTED: 'submitted-for-approval',
      APPROVED: 'approved',
      INITIALISED: 'initialised',
      ACTIVATED: 'activated',
      PAUSED: 'paused',
      COMPLETED: 'completed',
    },
  },
  QUALIFYING_TEST_RESPONSES: {
    STATUS: {
      CREATED: 'created',
      ACTIVATED: 'activated',
      STARTED: 'started',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
  },
  NOTIFY_KEY: functions.config().notify.key,
  SLACK_URL: functions.config().slack.url,
  STORAGE_URL: functions.config().project.id + '.appspot.com',
};

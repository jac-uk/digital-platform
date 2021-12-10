const functions = require('firebase-functions');

module.exports = {
  PROJECT_ID: functions.config().project.id,
  APPLY_URL: functions.config().apply.url,
  APPLICATION: {
    CHARACTER_ISSUES: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      criminalOffences: {
        title: 'Criminal Offences',
        details: 'criminalOffenceDetails',
        summary: 'Candidate has been cautioned or convicted of a criminal offence',
      },
      nonMotoringFixedPenaltyNotices: {
        title: 'Non Motoring Fixed Penalty Notices',
        details: 'nonMotoringFixedPenaltyNoticesDetails',
        summary: 'Candidate has received a non-motoring penalty notice in the last 4 years',
      },
      drivingDisqualificationDrinkDrugs: {
        title: 'Driving Disqualification Drink Drugs',
        details: 'drivingDisqualificationDrinkDrugsDetails',
        summary: 'Candidate has been disqualified from driving, or convicted for driving under the influence of drink or drugs',
      },
      endorsementsOrMotoringFixedPenalties: {
        title: 'Endorsements Or Motoring Fixed Penalties',
        details: 'endorsementsOrMotoringFixedPenaltiesDetails',
        summary: 'Candidate has endorsements on their licence, or received any motoring fixed-penalty notices in the last 4 years',
      },
      declaredBankruptOrIVA: {
        title: 'Declared Bankrupt Or IVA',
        details: 'declaredBankruptOrIVADetails',
        summary: 'Candidate has been declared bankrupt or entered into an Individual Voluntary Agreement (IVA)',
      },
      lateTaxReturnOrFined: {
        title: 'Late Tax Return Or Fined',
        details: 'lateTaxReturnOrFinedDetails',
        summary: 'Candidate has filed late tax returns or been fined by HMRC',
      },
      involvedInProfessionalMisconduct: {
        title: 'Involved In Professional Misconduct',
        details: 'involvedInProfessionalMisconductDetails',
        summary: 'Candidate has been, or is currently, subject to professional misconduct, negligence, wrongful dismissal, discrimination or harassment proceedings',
      },
      diciplinaryActionOrAskedToResign: {
        title: 'Disciplinary Action Or Asked To Resign',
        details: 'diciplinaryActionOrAskedToResignDetails',
        summary: 'Candidate has been subject to complaints or disciplinary action, or been asked to resign from a position',
      },
      otherCharacterIssues: {
        title: 'Other Character Issues',
        details: 'otherCharacterIssuesDetails',
        summary: 'Candidate has declared other issues we should know about',
      },
    },
    CHARACTER_ISSUES_V2: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      criminalConvictions: {
        title: 'Criminal Convictions',
        details: 'criminalConvictionDetails',
        summary: 'Candidate has been convicted for a criminal offence',
      },
      criminalCautions: {
        title: 'Criminal Cautions',
        details: 'criminalCautionDetails',
        summary: 'Candidate has been cautioned for a criminal offence',
      },
      fixedPenalties: {
        title: 'Fixed Penalties',
        details: 'fixedPenaltyDetails',
        summary: 'Candidate has received a fixed-penalty',
      },
      drivingDisqualifications: {
        title: 'Driving Disqualifications',
        details: 'drivingDisqualificationDetails',
        summary: 'Candidate has been disqualified from driving',
      },
      recentDrivingConvictions: {
        title: 'Driving Convictions',
        details: 'recentDrivingConvictionDetails',
        summary: 'Candidate has been convicted for a driving offence',
      },
      bankruptcies: {
        title: 'Bankruptcies',
        details: 'bankruptcyDetails',
        summary: 'Candidate has been declared bankrupt',
      },
      ivas: {
        title: 'IVAs',
        details: 'ivaDetails',
        summary: 'Candidate has been entered into an Individual Voluntary Agreement (IVA)',
      },
      lateTaxReturns: {
        title: 'Late tax returns',
        details: 'lateTaxReturnDetails',
        summary: 'Candidate has filed late tax returns',
      },
      lateVatReturns: {
        title: 'Late VAT returns',
        details: 'lateVatReturnDetails',
        summary: 'Candidate has filed late VAT returns',
      },
      hmrcFines: {
        title: 'HMRC fines',
        details: 'hmrcFineDetails',
        summary: 'Candidate has received a fine from HMRC',
      },
      subjectOfAllegationOrClaimOfProfessionalMisconduct: {
        title: 'Subject Of Allegation Or Claim Of Professional Misconduct',
        details: 'subjectOfAllegationOrClaimOfProfessionalMisconductDetails',
        summary: 'Candidate has been the subject of allegation or claim of misconduct',
      },
      subjectOfAllegationOrClaimOfNegligence: {
        title: 'Subject Of Allegation Or Claim Of Negligence',
        details: 'subjectOfAllegationOrClaimOfNegligenceDetails',
        summary: 'Candidate has been the subject of allegation or claim of negligence',
      },
      subjectOfAllegationOrClaimOfWrongfulDismissal: {
        title: 'Subject Of Allegation Or Claim Of Wrongful Dismissal',
        details: 'subjectOfAllegationOrClaimOfWrongfulDismissalDetails',
        summary: 'Candidate has been the subject of allegation or claim of wrongful dismissal',
      },
      subjectOfAllegationOrClaimOfDiscriminationProceeding: {
        title: 'Subject Of Allegation Or Claim Of Discrimination Proceeding',
        details: 'subjectOfAllegationOrClaimOfDiscriminationProceedingDetails',
        summary: 'Candidate has been the subject of allegation or claim of discrimination proceedings',
      },
      subjectOfAllegationOrClaimOfHarassmentProceeding: {
        title: 'Subject Of Allegation Or Claim Of Harassment Proceeding',
        details: 'subjectOfAllegationOrClaimOfHarassmentProceedingDetails',
        summary: 'Candidate has been the subject of allegation or claim of harassment proceedings',
      },
      complaintOrDisciplinaryAction: {
        title: 'Complaint Or Disciplinary Action',
        details: 'complaintOrDisciplinaryActionDetails',
        summary: 'Candidate has been the subject of a complaint or disciplinary action',
      },
      requestedToResign: {
        title: 'Requested To Resign',
        details: 'requestedToResignDetails',
        summary: 'Candidate has been asked to resign',
      },
      furtherInformation: {
        title: 'Further Information',
        details: 'furtherInformationDetails',
        summary: 'Candidate has declared further information',
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

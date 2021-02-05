module.exports = {
  APPLY_URL: process.env.APPLY_URL,
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
  },
  ASSESSMENTS_URL: process.env.ASSESSMENTS_URL,
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
    },
  },
  NOTIFY_KEY: process.env.NOTIFY_LIMITED_KEY,
  SLACK_URL: process.env.SLACK_URL,
  STORAGE_URL: process.env.PROJECT_ID + '.appspot.com',
};

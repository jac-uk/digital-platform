const functions = require('firebase-functions');

const CONSTANTS = {
  PROJECT_ID: functions.config().project.id,
  IS_LOCAL: functions.config().project.is_local,
  APPLY_URL: functions.config().apply.url,
  // QT_URL: 'http://localhost:5001/jac-qualifying-tests-develop/europe-west2/api/v1',
  QT_URL: functions.config().qt_platform.url,
  QT_KEY: functions.config().qt_platform.key,
  ZENHUB_GRAPH_QL_API_KEY: functions.config().zenhub.graph_ql_api_key, // graphQL personal api key
  ZENHUB_ISSUES_WORKSPACE_ID: functions.config().zenhub.workspace_id,
  GITHUB_WEBHOOK_SECRET: functions.config().github.webhook_secret,
  GITHUB_PAT: functions.config().github.pat, // personal access token
  SLACK_TICKETING_APP_BOT_TOKEN: functions.config().slack.ticketing_app_bot_token,
  SLACK_TICKETING_APP_CHANNEL_ID: functions.config().slack.ticketing_app_channel_id,
  APPLICATION: {
    STATUS: {
      QUALIFYING_TEST_PASSED: 'qualifyingTestPassed',
      QUALIFYING_TEST_FAILED: 'qualifyingTestFailed',
      SCENARIO_TEST_PASSED: 'scenarioTestPassed',
      SCENARIO_TEST_FAILED: 'scenarioTestFailed',
      SIFT_PASSED: 'siftPassed',
      SIFT_FAILED: 'siftFailed',
      SELECTION_INVITED: 'selectionInvited',
      REJECTED_INELIGIBLE_STATUTORY: 'rejectedIneligibleStatutory',
      REJECTED_INELIGIBLE_ADDITIONAL: 'rejectedIneligibleAdditional',
      REJECTED_CHARACTER: 'rejectedCharacter',
      WITHDRAWN: 'withdrawn',
      SELECTION_PASSED: 'selectionPassed',
      SELECTION_FAILED: 'selectionFailed',
      PASSED_RECOMMENDED: 'passedRecommended',
      PASSED_NOT_RECOMMENDED: 'passedNotRecommended',
      RECOMMENDED_IMMEDIATE: 'recommendedImmediate',
      RECOMMENDED_FUTURE: 'recommendedFuture',
      RECONSIDER: 'reconsider',
      SECOND_STAGE_INVITED: 'secondStageInvited',
      SCC_TO_RECONSIDER: 'sccToReconsider',
    },
    CHARACTER_ISSUES: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      drivingDisqualificationDrinkDrugs: {
        group: 'Motoring Offences',
        title: 'Driving Disqualification Drink Drugs',
        details: 'drivingDisqualificationDrinkDrugsDetails',
        summary: 'Candidate has been disqualified from driving, or convicted for driving under the influence of drink or drugs',
      },
      endorsementsOrMotoringFixedPenalties: {
        group: 'Motoring Offences',
        title: 'Endorsements Or Motoring Fixed Penalties',
        details: 'endorsementsOrMotoringFixedPenaltiesDetails',
        summary: 'Candidate has endorsements on their licence, or received any motoring fixed-penalty notices in the last 4 years',
      },
      nonMotoringFixedPenaltyNotices: {
        group: 'Motoring Offences',
        title: 'Non Motoring Fixed Penalty Notices',
        details: 'nonMotoringFixedPenaltyNoticesDetails',
        summary: 'Candidate has received a non-motoring penalty notice in the last 4 years',
      },
      criminalOffences: {
        group: 'Criminal Offences',
        title: 'Criminal Offences',
        details: 'criminalOffenceDetails',
        summary: 'Candidate has been cautioned or convicted of a criminal offence',
      },
      declaredBankruptOrIVA: {
        group: 'Financial Matters',
        title: 'Declared Bankrupt Or IVA',
        details: 'declaredBankruptOrIVADetails',
        summary: 'Candidate has been declared bankrupt or entered into an Individual Voluntary Agreement (IVA)',
      },
      lateTaxReturnOrFined: {
        group: 'Financial Matters',
        title: 'Late Tax Return Or Fined',
        details: 'lateTaxReturnOrFinedDetails',
        summary: 'Candidate has filed late tax returns or been fined by HMRC',
      },
      diciplinaryActionOrAskedToResign: {
        group: 'Professional Conduct',
        title: 'Disciplinary Action Or Asked To Resign',
        details: 'diciplinaryActionOrAskedToResignDetails',
        summary: 'Candidate has been subject to complaints or disciplinary action, or been asked to resign from a position',
      },
      involvedInProfessionalMisconduct: {
        group: 'Professional Conduct',
        title: 'Involved In Professional Misconduct',
        details: 'involvedInProfessionalMisconductDetails',
        summary: 'Candidate has been, or is currently, subject to professional misconduct, negligence, wrongful dismissal, discrimination or harassment proceedings',
      },
      otherCharacterIssues: {
        group: 'Further Information to be disclosed',
        title: 'Other Character Issues',
        details: 'otherCharacterIssuesDetails',
        summary: 'Candidate has declared other issues we should know about',
      },
    },
    CHARACTER_ISSUES_V2: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      drivingDisqualifications: {
        group: 'Motoring Offences',
        title: 'Driving Disqualifications',
        details: 'drivingDisqualificationDetails',
        summary: 'Candidate has been disqualified from driving',
      },
      recentDrivingConvictions: {
        group: 'Motoring Offences',
        title: 'Recent Driving Convictions',
        details: 'recentDrivingConvictionDetails',
        summary: 'Candidate has recent driving convictions',
      },
      fixedPenalties: {
        group: 'Fixed Penalty Notices',
        title: 'Fixed Penalties',
        details: 'fixedPenaltyDetails',
        summary: 'Candidate has received a fixed-penalty',
      },
      criminalConvictions: {
        group: 'Criminal Offences',
        title: 'Criminal Convictions',
        details: 'criminalConvictionDetails',
        summary: 'Candidate has been convicted of a criminal offence',
      },
      criminalCautions: {
        group: 'Criminal Offences',
        title: 'Criminal Cautions',
        details: 'criminalCautionDetails',
        summary: 'Candidate has been cautioned for a criminal offence',
      },
      bankruptcies: {
        group: 'Financial Matters',
        title: 'Bankruptcies',
        details: 'bankruptcyDetails',
        summary: 'Candidate has filed for bankruptcy',
      },
      ivas: {
        group: 'Financial Matters',
        title: 'IVAs',
        details: 'ivaDetails',
        summary: 'Candidate has been entered into an Individual Voluntary Agreement (IVA)',
      },
      lateTaxReturns: {
        group: 'Financial Matters',
        title: 'Late Tax Returns',
        details: 'lateTaxReturnDetails',
        summary: 'Candidate has filed late tax returns',
      },
      lateVatReturns: {
        group: 'Financial Matters',
        title: 'Late VAT Returns',
        details: 'lateVatReturnDetails',
        summary: 'Candidate has filed late VAT returns',
      },
      hmrcFines: {
        group: 'Financial Matters',
        title: 'HMRC Fines',
        details: 'hmrcFineDetails',
        summary: 'Candidate has received a fine from HMRC',
      },
      subjectOfAllegationOrClaimOfProfessionalMisconduct: {
        group: 'Professional Conduct',
        title: 'Subject Of Allegation Or Claim Of Professional Misconduct',
        details: 'subjectOfAllegationOrClaimOfProfessionalMisconductDetails',
        summary: 'Candidate has been the subject of allegation or claim of misconduct',
      },
      subjectOfAllegationOrClaimOfNegligence: {
        group: 'Professional Conduct',
        title: 'Subject Of Allegation Or Claim Of Negligence',
        details: 'subjectOfAllegationOrClaimOfNegligenceDetails',
        summary: 'Candidate has been the subject of allegation or claim of negligence',
      },
      subjectOfAllegationOrClaimOfWrongfulDismissal: {
        group: 'Professional Conduct',
        title: 'Subject Of Allegation Or Claim Of Wrongful Dismissal',
        details: 'subjectOfAllegationOrClaimOfWrongfulDismissalDetails',
        summary: 'Candidate has been the subject of allegation or claim wrongful dismissal',
      },
      subjectOfAllegationOrClaimOfDiscriminationProceeding: {
        group: 'Professional Conduct',
        title: 'Subject Of Allegation Or Claim Of Discrimination Proceeding',
        details: 'subjectOfAllegationOrClaimOfDiscriminationProceedingDetails',
        summary: 'Candidate subject of allegation or claim of discrimination proceeding',
      },
      subjectOfAllegationOrClaimOfHarassmentProceeding: {
        group: 'Professional Conduct',
        title: 'Subject Of Allegation Or Claim Of Harassment Proceeding',
        details: 'subjectOfAllegationOrClaimOfHarassmentProceedingDetails',
        summary: 'Candidate is subject of allegation or claim of harassment proceeding',
      },
      complaintOrDisciplinaryAction: {
        group: 'Professional Conduct',
        title: 'Complaint Or Disciplinary Action',
        details: 'complaintOrDisciplinaryActionDetails',
        summary: 'Candidate has received a complaint or disciplinary action',
      },
      requestedToResign: {
        group: 'Professional Conduct',
        title: 'Requested To Resign',
        details: 'requestedToResignDetails',
        summary: 'Candidate has been requested to resign',
      },
      furtherInformation: {
        group: 'Further Information to be disclosed',
        title: 'Further Information',
        details: 'furtherInformationDetails',
        summary: 'Candidate has declare further information',
      },
    },
    CHARACTER_ISSUE_STATUS: {
      PROCEED: 'proceed',
      REJECT: 'reject',
      REJECT_NON_DECLARATION: 'reject-non-declaration',
      DISCUSS: 'discuss',
    },
    CHARACTER_ISSUE_OFFENCE_CATEGORY: {
      SINGLE_CRIMINAL_OFFENCE: 'singleCriminalOffence',
      MULTIPLE_CRIMINAL_OFFENCES: 'multipleCriminalOffences',
      SINGLE_MOTORING_OFFENCE: 'singleMotoringOffence',
      MULTIPLE_MOTORING_OFFENCES: 'multipleMotoringOffences',
      SINGLE_FINANCIAL_OFFENCE: 'singleFinancialOffence',
      MULTIPLE_FINANCIAL_OFFENCES: 'multipleFinancialOffences',
      SINGLE_PROFESSIONAL_CONDUCT: 'singleProfessionalConduct',
      MULTIPLE_PROFESSIONAL_CONDUCTS: 'multipleProfessionalConducts',
      SINGLE_OTHER_MATTER: 'singleOtherMatter',
      MULTIPLE_OTHER_MATTERS: 'multipleOtherMatters',
      MIXED: 'mixed',
    },
    ELIGIBILITY_ISSUE_STATUS: {
      PROCEED: 'proceed',
      REJECT: 'reject',
      REJECT_NON_DECLARATION: 'reject-non-declaration',
      DISCUSS: 'discuss',
    },
  },
  ASSESSMENTS_URL: functions.config().assessments.url,
  ASSESSMENT_METHOD: {
    SELF_ASSESSMENT_WITH_COMPETENCIES: 'selfAssessmentWithCompetencies',
    COVERING_LETTER: 'coveringLetter',
    CV: 'cv',
    STATEMENT_OF_SUITABILITY_WITH_COMPETENCIES: 'statementOfSuitabilityWithCompetencies',
    STATEMENT_OF_SUITABILITY_WITH_SKILLS_AND_ABILITIES: 'statementOfSuitabilityWithSkillsAndAbilities',
    STATEMENT_OF_ELIGIBILITY: 'statementOfEligibility',
    INDEPENDENT_ASSESSMENTS: 'independentAssessments',
    LEADERSHIP_JUDGE_ASSESSMENT: 'leadershipJudgeAssessment',
  },
  ASSESSMENT_TYPE: {
    COMPETENCY: 'competency',
    SKILLS: 'skills',
    GENERAL: 'general',
  },
  SHORTLISTING: {
    TELEPHONE_ASSESSMENT: 'telephone-assessment',
    SITUATIONAL_JUDGEMENT_QUALIFYING_TEST: 'situational-judgement-qualifying-test',
    CRITICAL_ANALYSIS_QUALIFYING_TEST: 'critical-analysis-qualifying-test',
    SCENARIO_TEST_QUALIFYING_TEST: 'scenario-test-qualifying-test',
    NAME_BLIND_PAPER_SIFT: 'name-blind-paper-sift',
    PAPER_SIFT: 'paper-sift',
    OTHER: 'other',
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
  PANEL_STATUS: {
    // TODO include all statuses
    DRAFT: 'draft',
    APPROVED: 'approved',
    PROCESSING: 'processing',
    CREATED: 'created',
    SUBMITTED: 'submitted',
  },
  MARKING_TYPE: {
    GROUP: 'group',
    NUMBER: 'number',
    GRADE: 'grade',
  },
  GRADES: ['A', 'B', 'C', 'D'],
  GRADE_VALUES: {
    'A': 4,
    'B': 3,
    'C': 2,
    'D': 1,
  },
  CAPABILITIES: ['L', 'EJ', 'L&J', 'PQ', 'PBK', 'ACI', 'WCO', 'MWE', 'OVERALL'],
  SELECTION_CATEGORIES: ['leadership', 'roleplay', 'situational', 'interview', 'overall'],
  NOTIFY_KEY: functions.config().notify.key,
  SLACK_URL: functions.config().slack.url,
  SLACK_API_STUB: functions.config().slack.api_url,
  STORAGE_URL: functions.config().project.id + '.appspot.com',
  SCAN_SERVICE_URL: functions.config().scan_service.url,
  GOOGLE_RECAPTCHA_VALIDATION_URL: functions.config().google_recaptcha.url,
  GOOGLE_RECAPTCHA_SECRET: functions.config().google_recaptcha.secret,
  NOT_COMPLETE_PUPILLAGE_REASONS: {
    TRANSFERRED: 'transferred ',
    CALLED_PRE_2002: 'called-pre-2002',
    OTHER: 'other',
  },
  ZENHUB_GRAPH_QL_URL: functions.config().zenhub.graph_ql_url,
};

const TASK_TYPE = {
  SIFT: 'sift',
  SCENARIO: 'scenarioTest',
  CRITICAL_ANALYSIS: 'criticalAnalysis',
  SITUATIONAL_JUDGEMENT: 'situationalJudgement',
  QUALIFYING_TEST: 'qualifyingTest',
  TELEPHONE_ASSESSMENT: 'telephoneAssessment',
  ELIGIBILITY_SCC: 'eligibilitySCC',
  CHARACTER_AND_SELECTION_SCC: 'characterAndSelectionSCC',
  STATUTORY_CONSULTATION: 'statutoryConsultation',
  SHORTLISTING_OUTCOME: 'shortlistingOutcome',
  WELSH_ASSESSMENT: 'welshAssessment',
  PRE_SELECTION_DAY_QUESTIONNAIRE: 'preSelectionDayQuestionnaire',
  SELECTION_DAY: 'selectionDay',
  SELECTION_OUTCOME: 'selectionOutcome',
  EMP_TIEBREAKER: 'empTiebreaker',
};

const SHORTLISTING_TASK_TYPES = [
  TASK_TYPE.TELEPHONE_ASSESSMENT,
  TASK_TYPE.SIFT,
  TASK_TYPE.CRITICAL_ANALYSIS,
  TASK_TYPE.SITUATIONAL_JUDGEMENT,
  TASK_TYPE.QUALIFYING_TEST,
  TASK_TYPE.SCENARIO,
];

const TASK_STATUS = { // aka task STEPS
  CANDIDATE_FORM_CONFIGURE: 'candidateFormConfigure',
  CANDIDATE_FORM_MONITOR: 'candidateFormMonitor',
  DATA_INITIALISED: 'dataInitialised',
  DATA_ACTIVATED: 'dataActivated',
  TEST_INITIALISED: 'testInitialised',
  TEST_ACTIVATED: 'testActivated',
  PANELS_INITIALISED: 'panelsInitialised',
  PANELS_ACTIVATED: 'panelsActivated',
  MODERATION_INITIALISED: 'moderationInitialised',
  MODERATION_ACTIVATED: 'moderationActivated',
  STATUS_CHANGES: 'statusChanges',
  STAGE_OUTCOME: 'stageOutcome',
  FINALISED: 'finalised',
  CHECKS: 'checks',
  COMPLETED: 'completed',
};

const CANDIDATE_FORM_STATUS = {
  CREATED: 'created',
  OPEN: 'open',
  CLOSED: 'closed',
};

const CANDIDATE_FORM_RESPONSE_STATUS = {
  CREATED: 'created',
  REQUESTED: 'requested',
  COMPLETED: 'completed',
};

const EXERCISE_STAGE = {
  // v2
  SHORTLISTING: 'shortlisting',
  SELECTION: 'selection',
  SCC: 'scc',
  RECOMMENDATION: 'recommendation',

  // v2 proposed but then removed
  APPLIED: 'applied', // to be removed
  SELECTABLE: 'selectable', // to be removed

  // v1
  REVIEW: 'review', // to be replaced with shortlisting
  SHORTLISTED: 'shortlisted', // to be replaced with selection
  SELECTED: 'selected', // to be replaced with recommendation
  RECOMMENDED: 'recommended', // to be replaced with recommendation
  HANDOVER: 'handover', // to be removed/replaced with recommendation
};

const APPLICATION_STATUS = {
  // v2
  CRITICAL_ANALYSIS_PASSED: 'criticalAnalysisPassed',
  CRITICAL_ANALYSIS_FAILED: 'criticalAnalysisFailed',
  SITUATIONAL_JUDGEMENT_PASSED: 'situationalJudgementPassed',
  SITUATIONAL_JUDGEMENT_FAILED: 'situationalJudgementFailed',
  QUALIFYING_TEST_PASSED: 'qualifyingTestPassed',
  QUALIFYING_TEST_FAILED: 'qualifyingTestFailed',
  QUALIFYING_TEST_NOT_SUBMITTED: 'noTestSubmitted',
  SCENARIO_TEST_PASSED: 'scenarioTestPassed',
  SCENARIO_TEST_FAILED: 'scenarioTestFailed',
  SCENARIO_TEST_NOT_SUBMITTED: 'noScenarioTestSubmitted',
  SIFT_PASSED: 'siftPassed',
  SIFT_FAILED: 'siftFailed',
  TELEPHONE_ASSESSMENT_PASSED: 'telephoneAssessmentPassed',
  TELEPHONE_ASSESSMENT_FAILED: 'telephoneAssessmentFailed',
  SHORTLISTING_PASSED: 'shortlistingOutcomePassed',
  SHORTLISTING_FAILED: 'shortlistingOutcomeFailed',
  FULL_APPLICATION_NOT_SUBMITTED: 'fullApplicationNotSubmitted',
  ELIGIBILITY_SCC_PASSED: 'eligibilitySCCPassed',
  ELIGIBILITY_SCC_FAILED: 'eligibilitySCCFailed',
  CHARACTER_AND_SELECTION_SCC_PASSED: 'characterAndSelectionSCCPassed',
  CHARACTER_AND_SELECTION_SCC_FAILED: 'characterAndSelectionSCCFailed',
  STATUTORY_CONSULTATION_PASSED: 'statutoryConsultationPassed',
  STATUTORY_CONSULTATION_FAILED: 'statutoryConsultationFailed',
  SELECTION_INVITED: 'selectionInvited',
  REJECTED_INELIGIBLE_STATUTORY: 'rejectedIneligibleStatutory',
  REJECTED_INELIGIBLE_ADDITIONAL: 'rejectedIneligibleAdditional',
  REJECTED_CHARACTER: 'rejectedCharacter',
  SELECTION_DAY_PASSED: 'selectionDayPassed',
  SELECTION_DAY_FAILED: 'selectionDayFailed',
  SELECTION_PASSED: 'selectionOutcomePassed',
  SELECTION_FAILED: 'selectionOutcomeFailed',
  SELECTION_OUTCOME_PASSED: 'selectionOutcomePassed',
  SELECTION_OUTCOME_FAILED: 'selectionOutcomeFailed',
  PASSED_RECOMMENDED: 'passedRecommended',
  PASSED_NOT_RECOMMENDED: 'passedNotRecommended',
  RECOMMENDED_IMMEDIATE: 'recommendedImmediate',
  RECOMMENDED_FUTURE: 'recommendedFuture',
  RECONSIDER: 'reconsider',
  SECOND_STAGE_INVITED: 'secondStageInvited',
  SECOND_STAGE_PASSED: 'empTiebreakerPassed',
  SECOND_STAGE_FAILED: 'empTiebreakerFailed',
  APPROVED_IMMEDIATE: 'approvedImmediate',
  APPROVED_FUTURE: 'approvedFuture',
  WITHDRAWN: 'withdrawn',

  // v1 REVIEW
  PASSED_SIFT: 'passedSift',
  FAILED_SIFT: 'failedSift',
  SUBMITTED_FIRST_TEST: 'submittedFirstTest',
  FAILED_FIRST_TEST: 'failedFirstTest',
  SUBMITTED_SCENARIO_TEST: 'submittedScenarioTest',
  PASSED_FIRST_TEST: 'passedFirstTest',
  FAILED_SCENARIO_TEST: 'failedScenarioTest',
  PASSED_SCENARIO_TEST: 'passedScenarioTest',
  FAILED_TELEPHONE_ASSESSMENT: 'failedTelephoneAssessment',
  PASSED_TELEPHONE_ASSESSMENT: 'passedTelephoneAssessment',
  NO_TEST_SUBMITTED: 'noTestSubmitted',
  TEST_SUBMITTED_OVER_TIME: 'testSubmittedOverTime',
  WITHDREW_APPLICATION: 'withdrewApplication',
  REJECTED_AS_INELIGIBLE: 'rejectedAsIneligible',
  // v1 SHORTLISTED
  INVITED_TO_SELECTION_DAY: 'invitedToSelectionDay',
  // v1 SELECTED
  PASSED_SELECTION: 'passedSelection',
  FAILED_SELECTION: 'failedSelection',
  PASSED_BUT_NOT_RECOMMENDED: 'passedButNotRecommended',
  // v1 RECOMMENDED
  REJECTED_BY_CHARACTER: 'rejectedByCharacter',
  APPROVED_FOR_IMMEDIATE_APPOINTMENT: 'approvedForImmediateAppointment',
  APPROVED_FOR_FUTURE_APPOINTMENT: 'approvedForFutureAppointment',
  SCC_TO_RECONSIDER: 'sccToReconsider',
};

module.exports = {
  ...CONSTANTS,
  TASK_TYPE,
  SHORTLISTING_TASK_TYPES,
  TASK_STATUS,
  CANDIDATE_FORM_STATUS,
  CANDIDATE_FORM_RESPONSE_STATUS,
  EXERCISE_STAGE,
  APPLICATION_STATUS,
};

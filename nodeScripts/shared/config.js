module.exports = {
  PROJECT_ID: process.env.PROJECT_ID,
  APPLY_URL: process.env.APPLY_URL,
  APPLICATION: {
    CHARACTER_ISSUES: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      criminalOffences: {
        title: 'Criminal Offences',
        details: 'criminalOffenceDetails',
        summary: 'Candidate has been cautioned or convicted of a criminal offence',
      },
      declaredBankruptOrIVA: {
        title: 'Declared Bankrupt Or IVA',
        details: 'declaredBankruptOrIVADetails',
        summary: 'Candidate has been declared bankrupt or entered into an Individual Voluntary Agreement (IVA)',
      },
      diciplinaryActionOrAskedToResign: {
        title: 'Disciplinary Action Or Asked To Resign',
        details: 'diciplinaryActionOrAskedToResignDetails',
        summary: 'Candidate has been subject to complaints or disciplinary action, or been asked to resign from a position',
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
      involvedInProfessionalMisconduct: {
        title: 'Involved In Professional Misconduct',
        details: 'involvedInProfessionalMisconductDetails',
        summary: 'Candidate has been, or is currently, subject to professional misconduct, negligence, wrongful dismissal, discrimination or harassment proceedings',
      },
      lateTaxReturnOrFined: {
        title: 'Late Tax Return Or Fined',
        details: 'lateTaxReturnOrFinedDetails',
        summary: 'Candidate has filed late tax returns or been fined by HMRC',
      },
      nonMotoringFixedPenaltyNotices: {
        title: 'Non Motoring Fixed Penalty Notices',
        details: 'nonMotoringFixedPenaltyNoticesDetails',
        summary: 'Candidate has received a non-motoring penalty notice in the last 4 years',
      },
      otherCharacterIssues: {
        title: 'Other Character Issues',
        details: 'otherCharacterIssuesDetails',
        summary: 'Candidate has declared other issues we should know about',
      },
    },
    CHARACTER_ISSUES_V2: { // this gives a map from issue to corresponding details field TODO improve naming or where we store this
      bankruptcies: {
        title: 'Bankruptcies',
        details: 'bankruptcyDetails',
        summary: 'Candidate has filed for bankruptcy',
      },
      complaintOrDiciplinaryAction: {
        title: 'Complaint Or Diciplinary Action',
        details: 'complaintOrDiciplinaryActionDetails',
        summary: 'Candidate has received a complaint or diciplinary action',
      },
      criminalCautions: {
        title: 'Criminal Cautions',
        details: 'criminalCautionsDetails',
        summary: 'Candidate has been cautioned for a criminal offence',
      },
      criminalConvictions: {
        title: 'Criminal Convictions',
        details: 'criminalConvictionDetails',
        summary: 'Candidate has been convicted of a criminal offence',
      },
      declaredBankruptOrIVA: {
        title: 'Declared Bankrupt Or IVA',
        details: 'declaredBankruptOrIVADetails',
        summary: 'Candidate has been declared bankrupt or entered into an Individual Voluntary Agreement (IVA)',
      },
      diciplinaryActionOrAskedToResign: {
        title: 'Disciplinary Action Or Asked To Resign',
        details: 'diciplinaryActionOrAskedToResignDetails',
        summary: 'Candidate has received disciplinary action or been asked to resign from position',
      },
      drivingDisqualifications: {
        title: 'Driving Disqualifications',
        details: 'drivingDisqualificationDetails',
        summary: 'Candidate has been disqualified from driving',
      },
      drivingDisqualificationDrinkDrugs: {
        title: 'Driving Disqualification Drink Drugs',
        details: 'drivingDisqualificationDrinkDrugsDetails',
        summary: 'Candidate has been disqualified from driving for drink/drugs',
      },
      endorsementsOrMotoringFixedPenalties: {
        title: 'Endorsements Or Motoring Fixed Penalties',
        details: 'endorsementsOrMotoringFixedPenaltiesDetails',
        summary: 'Candidate has endorsements or motoring fixed-penalties',
      },
      fixedPenalties: {
        title: 'Fixed Penalties',
        details: 'fixedPenaltiesDetails',
        summary: 'Candidate has received a fixed-penalty',
      },
      furtherInformation: {
        title: 'Further Information',
        details: 'furtherInformationDetails',
        summary: 'Candidate has declare further information',
      },
      hmrcFines: {
        title: 'HMRC Fines',
        details: 'hmrcFineDetails',
        summary: 'Candidate has received a fine from HMRC',
      },
      involvedInProfessionalMisconduct: {
        title: 'Involved In Professional Misconduct',
        details: 'involvedInProfessionalMisconductDetails',
        summary: 'Candidate has been involved in professional misconduct',
      },
      ivas: {
        title: 'IVAs',
        details: 'ivaDetails',
        summary: 'Candidate has been entered into an Individual Voluntary Agreement (IVA)',
      },
      lateTaxReturns: {
        title: 'Late Tax Returns',
        details: 'lateTaxReturnDetails',
        summary: 'Candidate has filed late tax returns',
      },
      lateVatReturns: {
        title: 'Late VAT Returns',
        details: 'lateVatReturnDetails',
        summary: 'Candidate has filed late VAT returns',
      },
      nonMotoringFixedPenaltyNotices: {
        title: 'Non Motoring Fixed Penalty Notices',
        details: 'nonMotoringFixedPenaltyNoticesDetails',
        summary: 'Candidate has non-motoring fixed-penalty notices',
      },
      otherCharacterIssues: {
        title: 'Other Character Issues',
        details: 'otherCharacterIssuesDetails',
        summary: 'Candidate has declared other character issues',
      },
      recentDrivingConvictions: {
        title: 'Recent Driving Convictions',
        details: 'recentDrivingConvictionDetails',
        summary: 'Candidate has recent driving convictions',
      },
      requestedToResign: {
        title: 'Requested To Resign',
        details: 'requestedToResignDetails',
        summary: 'Candidate has been requested to resign',
      },
      subjectOfAllegationOrClaimOfDiscriminationProceeding: {
        title: 'Subject Of Allegation Or Claim Of Discrimination Proceeding',
        details: 'subjectOfAllegationOrClaimOfDiscriminationProceedingDetails',
        summary: 'Candidate subject of allegation or claim of discrimination proceeding',
      },
      subjectOfAllegationOrClaimOfHarassmentProceeding: {
        title: 'Subject Of Allegation Or Claim Of Harassment Proceeding',
        details: 'subjectOfAllegationOrClaimOfHarassmentProceedingDetails',
        summary: 'Candidate is subject of allegation or claim of harassment proceeding',
      },
      subjectOfAllegationOrClaimOfNegligence: {
        title: 'Subject Of Allegation Or Claim Of Negligence',
        details: 'subjectOfAllegationOrClaimOfNegligenceDetails',
        summary: 'Candidate has been the subject of allegation or claim of negligence',
      },
      subjectOfAllegationOrClaimOfProfessionalMisconduct: {
        title: 'Subject Of Allegation Or Claim Of Professional Misconduct',
        details: 'subjectOfAllegationOrClaimOfProfessionalMisconductDetails',
        summary: 'Candidate has been the subject of allegation or claim of misconduct',
      },
      subjectOfAllegationOrClaimOfWrongfulDismissal: {
        title: 'Subject Of Allegation Or Claim Of Wrongful Dismissal',
        details: 'subjectOfAllegationOrClaimOfWrongfulDismissalDetails',
        summary: 'Candidate has been the subject of allegation or claim wrongful dismissal',
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

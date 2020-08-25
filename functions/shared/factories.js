
module.exports = (CONSTANTS) => {
  return {
    newNotificationAssessmentRequest,
    newNotificationAssessmentReminder,
    newAssessment,
    newApplicationRecord,
    newVacancy,
  };

  function newNotificationAssessmentRequest(firebase, assessment) {
    const link = `${CONSTANTS.ASSESSMENTS_URL}/sign-in?email=${assessment.assessor.email}&ref=assessments/${assessment.id}`;
    let xCompetencyAreasOrXSkillsAndAbilities;
    switch (assessment.type) {
      case CONSTANTS.ASSESSMENT_TYPE.COMPETENCY:
        xCompetencyAreasOrXSkillsAndAbilities = 'competency areas';
        break;
      case CONSTANTS.ASSESSMENT_TYPE.SKILLS:
        xCompetencyAreasOrXSkillsAndAbilities = 'skills and abilities';
        break;
      default:
        xCompetencyAreasOrXSkillsAndAbilities = 'requirements';
    }
    return {
      email: assessment.assessor.email,
      replyTo: assessment.exercise.exerciseMailbox,
      template: {
        name: 'Assessment Request',
        id: '37093b3e-3743-45bb-b2d6-9e8465d97944',
      },
      personalisation: {
        assessorName: assessment.assessor.fullName,
        applicantName: assessment.candidate.fullName,
        exerciseName: assessment.exercise.name,
        xCompetencyAreasOrXSkillsAndAbilities: xCompetencyAreasOrXSkillsAndAbilities,
        submitAssessmentDueDate: assessment.dueDate.toDate().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        uploadUrl: link,
        downloadUrl: link,
        exerciseMailbox: assessment.exercise.exerciseMailbox,
        exercisePhoneNumber: assessment.exercise.exercisePhoneNumber,
        selectionExerciseManager: assessment.exercise.emailSignatureName,
      },
      reference: {
        collection: 'assessments',
        id: assessment.id,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationAssessmentReminder(firebase, assessment) {
    const link = `${CONSTANTS.ASSESSMENTS_URL}/sign-in?email=${assessment.assessor.email}&ref=assessments/${assessment.id}`;
    let xCompetencyAreasOrXSkillsAndAbilities;
    switch (assessment.type) {
      case CONSTANTS.ASSESSMENT_TYPE.COMPETENCY:
        xCompetencyAreasOrXSkillsAndAbilities = 'competency areas';
        break;
      case CONSTANTS.ASSESSMENT_TYPE.SKILLS:
        xCompetencyAreasOrXSkillsAndAbilities = 'skills and abilities';
        break;
      default:
        xCompetencyAreasOrXSkillsAndAbilities = 'requirements';
    }
    return {
      email: assessment.assessor.email,
      replyTo: assessment.exercise.exerciseMailbox,
      template: {
        name: 'Assessment Reminder',
        id: '5bd78bc3-5d3b-4cdf-88f5-2daba5464719',
      },
      personalisation: {
        assessorName: assessment.assessor.fullName,
        applicantName: assessment.candidate.fullName,
        exerciseName: assessment.exercise.name,
        xCompetencyAreasOrXSkillsAndAbilities: xCompetencyAreasOrXSkillsAndAbilities,
        submitAssessmentDueDate: assessment.dueDate.toDate().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        uploadUrl: link,
        downloadUrl: link,
        exerciseMailbox: assessment.exercise.exerciseMailbox,
        exercisePhoneNumber: assessment.exercise.exercisePhoneNumber,
        selectionExerciseManager: assessment.exercise.emailSignatureName,
      },
      reference: {
        collection: 'assessments',
        id: assessment.id,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newAssessment(exercise, application, whichAssessor) {
    let assessment = {
      assessor: {},
      candidate: {
        id: application.userId,
        fullName: application.personalDetails.fullName,
      },
      exercise: {
        id: exercise.id,
        name: exercise.name,
        referenceNumber: exercise.referenceNumber,
        template: (exercise.downloads && exercise.downloads.independentAssessors && exercise.downloads.independentAssessors[0]) ? exercise.downloads.independentAssessors[0] : '',
        exerciseMailbox: exercise.exerciseMailbox,
        exercisePhoneNumber: exercise.exercisePhoneNumber,
        emailSignatureName: exercise.emailSignatureName,
      },
      application: {
        id: application.id,
        referenceNumber: application.referenceNumber,
      },
      dueDate: exercise.independentAssessmentsReturnDate,
      fileRef: '',
      status: 'draft',
    }
    switch (whichAssessor) {
      case 'first':
        assessment.assessor.fullName = application.firstAssessorFullName;
        assessment.assessor.email = application.firstAssessorEmail;
        break;
      case 'second':
        assessment.assessor.fullName = application.secondAssessorFullName;
        assessment.assessor.email = application.secondAssessorEmail;
        break;
      default:
        assessment = {};
    }
    // assessment type
    switch (exercise.assessmentOptions) {
      case 'self-assessment-with-competencies':
      case 'self-assessment-with-competencies-and-cv':
      case 'statement-of-suitability-with-competencies':
        assessment.type = CONSTANTS.ASSESSMENT_TYPE.COMPETENCY;
        break;
      case 'statement-of-suitability-with-skills-and-abilities':
      case 'statement-of-suitability-with-skills-and-abilities-and-cv':
        assessment.type = CONSTANTS.ASSESSMENT_TYPE.SKILLS;
        break;
      case 'statement-of-eligibility':
      default:
        assessment.type = CONSTANTS.ASSESSMENT_TYPE.GENERAL;
        break;
    }
    return assessment;
  }

  function newApplicationRecord(exercise, application) {
    let applicationRecord = {
      exercise: {
        id: exercise.id,
        name: exercise.name,
        referenceNumber: exercise.referenceNumber,
      },
      candidate: {
        id: application.userId,
        fullName: application.personalDetails.fullName,
        reasonableAdjustments: application.personalDetails.reasonableAdjustments,
        reasonableAdjustmentsDetails: application.personalDetails.reasonableAdjustmentsDetails,
      },
      application: {
        id: application.id,
        referenceNumber: application.referenceNumber,
      },
      active: true,
      stage: 'review',
      status: '',
      flags: {
        characterIssues: false,
        eligibilityIssues: false,
        empApplied: false,
        reasonableAdjustments: application.personalDetails.reasonableAdjustments,
      },
      issues: {
        characterIssues: [],
        eligibilityIssues: [],
      },
      history: [],
      notes: [],
    }
    return applicationRecord;
  }

  /**
   * NOTE
   * - `vacancyModel` is generated from this spreadsheet:
   *   https://docs.google.com/spreadsheets/d/1JVe74eHM9-fDXvSfrOCuItpK6VN2q63skELCVm3S_Eo/edit#gid=923249835
   */
  function newVacancy(data) {
    const vacancyModel = {
      aboutTheRole: null,
      applicationCloseDate: null,
      applicationOpenDate: null,
      appliedSchedule: null,
      appointmentType: null,
      aSCApply: null,
      assessmentOptions: null,
      authorisations: null,
      characterChecks: null,
      contactIndependentAssessors: null,
      criticalAnalysisTestDate: null,
      criticalAnalysisTestEndTime: null,
      criticalAnalysisTestStartTime: null,
      downloads: null,
      estimatedLaunchDate: null,
      exerciseMailbox: null,
      exercisePhoneNumber: null,
      feePaidFee: null,
      finalOutcome: null,
      futureStart: null,
      immediateStart: null,
      independentAssessmentsReturnDate: null,
      isCourtOrTribunal: null,
      isSPTWOffered: null,
      jurisdiction: null,
      jurisdictionQuestion: null,
      jurisdictionQuestionAnswers: null,
      jurisdictionQuestionType: null,
      location: null,
      locationQuestion: null,
      locationQuestionAnswers: null,
      locationQuestionType: null,
      memberships: null,
      name: null,
      noSalaryDetails: null,
      otherJurisdiction: null,
      otherLOS: null,
      otherMemberships: null,
      otherQualifications: null,
      otherRetirement: null,
      otherShortlistingMethod: null,
      otherYears: null,
      postQualificationExperience: null,
      previousJudicialExperienceApply: null,
      qualifications: null,
      reasonableLengthService: null,
      referenceNumber: null,
      retirementAge: null,
      roleSummary: null,
      salaryGrouping: null,
      scenarioTestDate: null,
      scenarioTestEndTime: null,
      scenarioTestStartTime: null,
      schedule2Apply: null,
      selectionCriteria: null,
      selectionDays: null,
      selectionExerciseManagerFullName: null,
      shortlistingMethods: null,
      shortlistingOutcomeDate: null,
      situationalJudgementTestDate: null,
      situationalJudgementTestEndTime: null,
      situationalJudgementTestStartTime: null,
      subscriberAlertsUrl: null,
      typeOfExercise: null,
      uploadedCandidateAssessmentFormTemplate: null,
      uploadedIndependentAssessorTemplate: null,
      uploadedJobDescriptionTemplate: null,
      uploadedTermsAndConditionsTemplate: null,
      welshRequirement: null,
      welshRequirementType: null,
      yesSalaryDetails: null,
    };
    const vacancy = { ...vacancyModel };
    for (var key in vacancyModel) {
      if (data[key]) {
        vacancy[key] = data[key];
      }
    }
    return vacancy;
  }
}

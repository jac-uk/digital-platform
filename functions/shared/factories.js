
module.exports = (CONSTANTS) => {
  return {
    newNotificationCharacterCheckRequest,
    newNotificationAssessmentRequest,
    newNotificationAssessmentReminder,
    newAssessment,
    newApplicationRecord,
    newVacancy,
  };

  function newNotificationCharacterCheckRequest(firebase, application, type, exerciseMailbox, exerciseManagerName, dueDate) {
    let templateId = '';
    let templateName = '';
    if (type === 'request') {
      templateId = '5a4e7cbb-ab66-49a4-a8ad-7cbb399a8aa9';
      templateName = 'Character Check Request';
    } else {
      templateId = '5a4e7cbb-ab66-49a4-a8ad-7cbb399a8aa9'; // need a different reminder template
      templateName = 'Character Check Reminder';
    }
    return {
      email: application.personalDetails.email,
      replyTo: exerciseMailbox,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseName: application.exerciseName,
        dueDate: dueDate,
        urlRequired: 'https://apply.judicialappointments.digital/sign-in',
        applicantName: application.personalDetails.fullName,
        selectionExerciseManager: exerciseManagerName,
        exerciseMailbox: exerciseMailbox,
      },
      reference: {
        collection: 'applications',
        id: application.id,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

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
    };
    if (exercise.independentAssessmentsHardLimitDate) {
      assessment.hardLimitDate = exercise.independentAssessmentsHardLimitDate;
    }
    switch (whichAssessor) {
      case 'first':
        assessment.assessor.fullName = application.firstAssessorFullName ? application.firstAssessorFullName : '';
        assessment.assessor.email = application.firstAssessorEmail ? application.firstAssessorEmail : '';
        break;
      case 'second':
        assessment.assessor.fullName = application.secondAssessorFullName ? application.secondAssessorFullName : '';
        assessment.assessor.email = application.secondAssessorEmail ? application.secondAssessorEmail : '';
        break;
      default:
        assessment.assessor = {};
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

  function newDiversityFlags(application) {
    const applicationData = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
    const data = {
      gender: applicationData.gender,
      ethnicity: null,
      disability: applicationData.disability,
      professionalBackground: {
        barrister: null,
        cilex: null,
        solicitor: null,
        other: null,
        preferNotToSay: null,
      },
      socialMobility: {
        attendedUKStateSchool: null,
        firstGenerationUniversity: null,
      },
    };
    if (applicationData.ethnicGroup) {
      switch (applicationData.ethnicGroup) {
        case 'uk-ethnic':
        case 'irish':
        case 'gypsy-irish-traveller':
        case 'other-white':
          data.ethnicity = 'white';
          break;
        case 'prefer-not-to-say':
          data.ethnicity = applicationData.ethnicGroup;
          break;
        case 'other-ethnic-group':
          data.ethnicity = applicationData.ethnicGroup;
          break;
        default: // @todo check catch all is appropriate for bame
          data.ethnicity = 'bame';
      }
    }
    if (applicationData.professionalBackground && applicationData.professionalBackground.length) {
      if (applicationData.professionalBackground.indexOf('barrister') >= 0) {
        data.professionalBackground.barrister = true;
      }
      if (applicationData.professionalBackground.indexOf('cilex') >= 0) {
        data.professionalBackground.cilex = true;
      }
      if (applicationData.professionalBackground.indexOf('solicitor') >= 0) {
        data.professionalBackground.solicitor = true;
      }
      if (applicationData.professionalBackground.indexOf('other-professional-background') >= 0) {
        data.professionalBackground.other = true;
      }
      if (applicationData.professionalBackground.indexOf('prefer-not-to-say') >= 0) {
        data.professionalBackground.preferNotToSay = true;
      }
    }

    if (
      application.stateOrFeeSchool === 'uk-state-selective'
      || application.stateOrFeeSchool === 'uk-state-non-selective'
    ) {
      data.socialMobility.attendedUKStateSchool = true;
    }
    if (application.firstGenerationStudent === true) {
      data.socialMobility.firstGenerationUniversity = true;
    }

    return data;
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
      characterChecks: {
        status: 'not requested',
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
      diversity: newDiversityFlags(application),
      history: [],
      notes: [],
    };
    return applicationRecord;
  }

  /**
   * NOTE
   * - `vacancyModel` is generated from this spreadsheet:
   *   https://docs.google.com/spreadsheets/d/1JVe74eHM9-fDXvSfrOCuItpK6VN2q63skELCVm3S_Eo/edit#gid=923249835
   */
  function newVacancy(data) {
    const vacancyModel = {
      _applicationContent: null,
      _applicationVersion: null,
      aboutTheRole: null,
      additionalWorkingPreferences: null,
      applicationCloseDate: null,
      applicationOpenDate: null,
      appliedSchedule: null,
      appointmentType: null,
      aSCApply: null,
      assessmentMethods: null,
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
      inviteOnly: null,
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
      pjeDays: null,
      postQualificationExperience: null,
      previousJudicialExperienceApply: null,
      qualifications: null,
      reasonableLengthService: null,
      referenceNumber: null,
      retirementAge: null,
      roleSummary: null,
      roleSummaryWelsh: null,
      salary: null,
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
      state: null,
      subscriberAlertsUrl: null,
      typeOfExercise: null,
      uploadedCandidateAssessmentFormTemplate: null,
      uploadedIndependentAssessorTemplate: null,
      uploadedJobDescriptionTemplate: null,
      uploadedTermsAndConditionsTemplate: null,
      welshPosts: null,
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
};

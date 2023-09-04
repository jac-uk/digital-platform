const { formatDate } = require('./helpers');
const { applicationOpenDatePost01042023 } = require('./converters/helpers');

module.exports = (CONSTANTS) => {
  return {
    newNotificationExerciseApprovalSubmit,
    newNotificationApplicationSubmit,
    newNotificationApplicationReminder,
    newNotificationApplicationInWelsh,
    newNotificationCandidateFlagConfirmation,
    newNotificationCharacterCheckRequest,
    newNotificationAssessmentRequest,
    newNotificationAssessmentReminder,
    newNotificationAssessmentSubmit,
    newAssessment,
    newApplicationRecord,
    newVacancy,
    newNotificationLateApplicationRequest,
    newNotificationLateApplicationResponse,
  };

  function newNotificationExerciseApprovalSubmit(firebase, exerciseId, exercise, email) {
    const templateName = 'Exercise ready for approval';
    const templateId = '7ef31d79-d247-4a5e-af0d-d94941fb1151';
    return {
      email: email,
      replyTo: exercise.exerciseMailbox,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseId: exerciseId,
        exerciseName: exercise.name,
        refNumber: exercise.referenceNumber,
        selectionExerciseManager: exercise.emailSignatureName,
        exerciseMailbox: exercise.exerciseMailbox,
      },
      reference: {
        collection: 'exercises',
        id: exerciseId,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationApplicationSubmit(firebase, applicationId, application, exercise) {
    const templateName = 'Application Submitted';
    const templateId = 'd9c3cf7d-3755-4f96-a508-20909a91b825';

    return {
      email: application.personalDetails.email,
      replyTo: exercise.exerciseMailbox,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseId: exercise.id,
        exerciseRef: exercise.referenceNumber,
        exerciseName: application.exerciseName,
        applicantName: application.personalDetails.fullName,
        refNumber: application.referenceNumber,
        selectionExerciseManager: exercise.emailSignatureName,
        exerciseMailbox: exercise.exerciseMailbox,
      },
      reference: {
        collection: 'applications',
        id: applicationId,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationApplicationReminder(firebase, applicationId, application, exercise) {
    const templateName = 'Application Submission Reminder';
    const templateId = '32adeb86-20e2-4578-83df-6f37dcf19978';

    return {
      email: application.personalDetails.email,
      replyTo: exercise.exerciseMailbox,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseId: exercise.id,
        exerciseRef: exercise.referenceNumber,
        exerciseName: application.exerciseName,
        applicantName: application.personalDetails.fullName,
        exerciseCloseDate: formatDate(exercise.applicationCloseDate.toDate(), 'date-hour-minute'),
        refNumber: application.referenceNumber || null,
        selectionExerciseManager: exercise.emailSignatureName,
        exerciseMailbox: exercise.exerciseMailbox,
      },
      reference: {
        collection: 'applications',
        id: applicationId,
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'ready',
    };
  }

  function newNotificationApplicationInWelsh(firebase, applicationId, application, exercise) {
    const templateName = 'Application Submitted in Welsh';
    const templateId = '0acf9400-8694-4553-ab4a-23830c7626de';

    return {
      email: exercise.exerciseMailbox,
      replyTo: exercise.exerciseMailbox,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseId: exercise.id,
        exerciseRef: exercise.referenceNumber,
        exerciseName: application.exerciseName,
        applicationId: applicationId,
        applicantName: application.personalDetails.fullName,
        refNumber: application.referenceNumber,
        selectionExerciseManager: exercise.emailSignatureName,
        exerciseMailbox: exercise.exerciseMailbox,
      },
      reference: {
        collection: 'applications',
        id: applicationId,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationCandidateFlagConfirmation(firebase, applicationId, application, exercise, toEmail) {
    const templateName = 'Application from flagged candidate';
    const templateId = '618f780e-7a6e-4fd5-b530-548d587cae0b';

    return {
      email: toEmail,
      replyTo: exercise.exerciseMailbox,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseId: exercise.id,
        exerciseName: application.exerciseName,
        applicantName: application.personalDetails.fullName,
        refNumber: application.referenceNumber,
        selectionExerciseManager: exercise.emailSignatureName,
        exerciseMailbox: exercise.exerciseMailbox,
      },
      reference: {
        collection: 'applications',
        id: applicationId,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationCharacterCheckRequest(firebase, application, type, exerciseMailbox, exerciseManagerName, dueDate) {
    let templateId = '';
    let templateName = '';
    if (type === 'request') {
      templateId = '5a4e7cbb-ab66-49a4-a8ad-7cbb399a8aa9';
      templateName = 'Character check consent form request';
    } else if (type === 'submit') {
      templateId = 'a434c479-2002-492f-94b5-d9c1f1a7c85c';
      templateName = 'Character check consent form submit';
    } else {
      templateId = '163487cb-f4c6-4b7a-95bf-37fd958a14de';
      templateName = 'Character check consent form reminder';
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
        urlRequired: `${CONSTANTS.APPLY_URL}/sign-in`,
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

  function newNotificationAssessmentSubmit(firebase, assessment) {
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
        name: 'Assessment Submit',
        id: '5b933b71-3359-488a-aa86-13ceb581209c',
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
        assessment.assessor.type = application.firstAssessorType ? application.firstAssessorType : '';
        assessment.assessor.fullName = application.firstAssessorFullName ? application.firstAssessorFullName : '';
        assessment.assessor.email = application.firstAssessorEmail ? application.firstAssessorEmail : '';
        break;
      case 'second':
        assessment.assessor.type = application.secondAssessorType ? application.secondAssessorType : '';
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

  function newDiversityFlags(application, exercise) {
    const applicationData = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
    const data = {
      gender: applicationData.gender || null,
      ethnicity: null,
      disability: applicationData.disability || null,
      professionalBackground: {
        barrister: null,
        cilex: null,
        solicitor: null,
        other: null,
        preferNotToSay: null,
      },
      socialMobility: {
        attendedUKStateSchool: null,
      },
    };
    // Add checks for different fields after 01-04-2023
    if (applicationOpenDatePost01042023(exercise)) {
      data.socialMobility.parentsAttendedUniversity = null;
    }
    else {
      data.socialMobility.firstGenerationUniversity = null;
    }
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

    // Add checks for different fields after 01-04-2023
    if (applicationOpenDatePost01042023(exercise)) {
      if (
        application.stateOrFeeSchool16 === 'uk-state-selective'
        || application.stateOrFeeSchool16 === 'uk-state-non-selective'
      ) {
        data.socialMobility.attendedUKStateSchool = true;
      }
      if (application.parentsAttendedUniversity === true) {
        data.socialMobility.parentsAttendedUniversity = true;
      }
    }
    else {
      if (
        application.stateOrFeeSchool === 'uk-state-selective'
        || application.stateOrFeeSchool === 'uk-state-non-selective'
      ) {
        data.socialMobility.attendedUKStateSchool = true;
      }
      if (application.firstGenerationStudent === true) {
        data.socialMobility.firstGenerationUniversity = true;
      }
    }

    return data;
  }

  function newApplicationRecord(firebase, exercise, application) {
    let applicationRecord = {
      exercise: {
        id: exercise.id,
        name: exercise.name,
        referenceNumber: exercise.referenceNumber,
      },
      candidate: {
        id: application.userId,
      },
      application: {
        id: application.id,
        referenceNumber: application.referenceNumber,
      },
      characterChecks: {
        status: 'not requested',
      },
      active: true,
      stage: 'review',  // TODO change to 'applied'
      status: '',
      flags: {
        characterIssues: false,
        eligibilityIssues: false,
        empApplied: false,
      },
      issues: {
        characterIssues: [],
        eligibilityIssues: [],
      },
      diversity: newDiversityFlags(application, exercise),
      history: [],
      notes: [],
    };
    applicationRecord.stageLog = {};
    applicationRecord.stageLog[applicationRecord.stage] = firebase.firestore.FieldValue.serverTimestamp();
    if (application.personalDetails) {
      applicationRecord.candidate.fullName = application.personalDetails.fullName || null;
      applicationRecord.candidate.reasonableAdjustments = application.personalDetails.reasonableAdjustments || null;
      applicationRecord.candidate.reasonableAdjustmentsDetails = application.personalDetails.reasonableAdjustments && application.personalDetails.reasonableAdjustmentsDetails ? application.personalDetails.reasonableAdjustmentsDetails : null;
      applicationRecord.flags.reasonableAdjustments = application.personalDetails.reasonableAdjustments || null;
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
      _applicationContent: null,
      _applicationVersion: null,
      aboutTheRole: null,
      aboutTheRoleWelsh: null,
      additionalWorkingPreferences: null,
      advertType: null,
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
      selfAssessmentWordLimit: null,
      shortlistingMethods: null,
      siftStartDate: null,
      siftEndDate: null,
      nameBlindSiftStartDate: null,
      nameBlindSiftEndDate: null,
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
    const dataKeys = Object.keys(data);
    for (var key in vacancyModel) {
      if (dataKeys.includes(key)) {
        vacancy[key] = data[key];
      }
    }
    return vacancy;
  }

  function newNotificationLateApplicationRequest(firebase, messageId, message, toEmail) {
    const templateName = 'Late application request';
    const templateId = 'da36cb2a-5774-4e97-82e6-82664c43d87c';
    const msgType = message.type;
    const replyTo = message.from.email;
    return {
      email: toEmail,
      replyTo: replyTo,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseId: message[msgType].exerciseId,
        exerciseName: message[msgType].exerciseName,
        exerciseRef: message[msgType].exerciseRef,
        reason: message[msgType].reason,
        candidateId: message[msgType].candidateId,
        candidateName: message[msgType].candidateName,
        candidateEmail: message[msgType].candidateEmail,
        url: message[msgType].url,
      },
      reference: {
        collection: 'messages',
        id: messageId,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationLateApplicationResponse(firebase, messageId, message, toEmail) {
    const templateName = 'Late application response';
    const templateId = 'e9087c43-de88-4dcd-a868-2299efcbc7a2';
    const msgType = message.type;
    const replyTo = message.from.email;
    const rejectionReason = Object.prototype.hasOwnProperty.call(message[msgType], 'rejectionReason') ? message[msgType].rejectionReason : '';
    const applicationId = Object.prototype.hasOwnProperty.call(message[msgType], 'applicationId') ? message[msgType].applicationId : '';
    return {
      email: toEmail,
      replyTo: replyTo,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        applicationId: applicationId,
        exerciseId: message[msgType].exerciseId,
        exerciseName: message[msgType].exerciseName,
        exerciseRef: message[msgType].exerciseRef,
        reason: message[msgType].reason,
        candidateId: message[msgType].candidateId,
        candidateName: message[msgType].candidateName,
        candidateEmail: message[msgType].candidateEmail,
        decision: message[msgType].decision,
        decisionAt: message[msgType].decisionAt,
        rejectionReason: rejectionReason,
        url: message[msgType].url,
      },
      reference: {
        collection: 'messages',
        id: messageId,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }
};

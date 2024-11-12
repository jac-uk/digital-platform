import { formatDate, objectHasNestedProperty } from './helpers.js';
import { applicationOpenDatePost01042023 } from './converters/helpers.js';
import { getSearchMap } from './search.js';
import _ from 'lodash';

export default (CONSTANTS) => {
  return {
    newNotificationExerciseApprovalSubmit,
    newNotificationApplicationSubmit,
    newNotificationFullApplicationSubmit,
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
    newUser,
    newNotificationUserInvitation,
    newCandidateFormResponse,
    newCandidateFormNotification,
    newNotificationPublishedFeedbackReport,
    newNotificationEmailVerificationLink,
    newSmsNotificationLoginVerificationNumber,
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

  function newNotificationFullApplicationSubmit(firebase, applicationId, application, exercise) {
    const templateName = 'Full Application Submitted';
    const templateId = 'd411b686-f86f-46be-b4a0-4d3946e2beff';

    let secondStageClosingDate = '';
    if (exercise._applicationContent 
        && exercise._applicationContent._currentStep 
        && exercise._applicationContent._currentStep.end) {
      secondStageClosingDate = formatDate(exercise._applicationContent._currentStep.end.toDate());
    }

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
        secondStageClosingDate: secondStageClosingDate,
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

  function newNotificationAssessmentRequest(firebase, assessment, exercise) {
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
      replyTo: exercise.exerciseMailbox,
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
        exerciseMailbox: exercise.exerciseMailbox,
        exercisePhoneNumber: exercise.exercisePhoneNumber,
        selectionExerciseManager: exercise.emailSignatureName,
      },
      reference: {
        collection: 'assessments',
        id: assessment.id,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationAssessmentReminder(firebase, assessment, exercise) {
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
      replyTo: exercise.exerciseMailbox,
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
        exerciseMailbox: exercise.exerciseMailbox,
        exercisePhoneNumber: exercise.exercisePhoneNumber,
        selectionExerciseManager: exercise.emailSignatureName,
      },
      reference: {
        collection: 'assessments',
        id: assessment.id,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationAssessmentSubmit(firebase, assessment, exercise) {
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
      replyTo: exercise.exerciseMailbox,
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
        exerciseMailbox: exercise.exerciseMailbox,
        exercisePhoneNumber: exercise.exercisePhoneNumber,
        selectionExerciseManager: exercise.emailSignatureName,
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
        // exerciseMailbox: exercise.exerciseMailbox,
        // exercisePhoneNumber: exercise.exercisePhoneNumber,
        // emailSignatureName: exercise.emailSignatureName,
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
    if (exercise.assessmentMethods) {
      if (
        exercise.assessmentMethods[CONSTANTS.ASSESSMENT_METHOD.SELF_ASSESSMENT_WITH_COMPETENCIES] ||
        exercise.assessmentMethods[CONSTANTS.ASSESSMENT_METHOD.STATEMENT_OF_SUITABILITY_WITH_COMPETENCIES]
      ) {
        assessment.type = CONSTANTS.ASSESSMENT_TYPE.COMPETENCY;
      } else if (exercise.assessmentMethods[CONSTANTS.ASSESSMENT_METHOD.STATEMENT_OF_SUITABILITY_WITH_SKILLS_AND_ABILITIES]) {
        assessment.type = CONSTANTS.ASSESSMENT_TYPE.SKILLS;
      }
    }
    if (!assessment.type) {
      assessment.type = CONSTANTS.ASSESSMENT_TYPE.GENERAL;
    }

    // build searchables for search map
    const searchables = [
      application.personalDetails.fullName, // candidate name
      application.referenceNumber,
    ];
    // Add assessor details (if they exist)
    if (objectHasNestedProperty(assessment, 'assessor.fullName')) {
      searchables.push(assessment.assessor.fullName);
    }
    if (objectHasNestedProperty(assessment, 'assessor.email')) {
      searchables.push(assessment.assessor.email);
    }
    // build search map
    const searchMap = getSearchMap(searchables);
    // add search map to assessment
    assessment._search = searchMap;

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
    // add search map
    const search = getSearchMap([
      application.personalDetails.fullName,
      application.personalDetails.email,
      application.personalDetails.nationalInsuranceNumber,
      application.referenceNumber,
    ]);
    
    let applicationRecord = {
      _search: search,
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
      stage: exercise._processingVersion >= 2 ? CONSTANTS.EXERCISE_STAGE.SHORTLISTING : CONSTANTS.EXERCISE_STAGE.REVIEW,
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
      _processingVersion: null,
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
      jurisdictionPreferences: null,
      jurisdictionQuestion: null,
      jurisdictionQuestionAnswers: null,
      jurisdictionQuestionType: null,
      location: null,
      locationPreferences: null,
      locationQuestion: null,
      locationQuestionAnswers: null,
      locationQuestionType: null,
      locationWelsh: null,
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
      published: null,
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
      selfAssessmentWordLimits: null,
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
        if (key === 'commissioners') { // this is redundant code however has been retained so that we do not copy `commissioners` to `vacancy` document
          vacancy[key] = [];
        } else {
          vacancy[key] = data[key];
        }
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

  function newUser(user) {
    return {
      displayName: user.displayName || null,
      email: user.email || null,
      disabled: user.disabled || false,
      providerData: user.providerData ? user.providerData.map(p => p.providerId) : [],
      role: {
        id: user.customClaims && user.customClaims.r ? user.customClaims.r : null,
        isChanged: false,
      },
      uid: user.uid || null,
    };
  }

  function newCandidateFormResponse(firebase, formId, taskType, applicationId) {
    return {
      formId,
      taskType,
      applicationId,
      status: 'created',  // TODO use constant
      statusLog: {
        created: firebase.firestore.FieldValue.serverTimestamp(),
      },
      progress: {},
    };
  }

  function newCandidateFormNotification(firebase, application, type, exerciseMailbox, exerciseManagerName, dueDate) {
    let templateId = '';
    let templateName = '';
    
    if (type === 'request') {
      templateId = 'bba6cebb-b3b3-4ba3-818b-af7b9a011f77';
      templateName = 'Candidate form consent form request';
    } else if (type === 'reminder') {
      templateId = '59522cc8-ede1-464c-8ab9-91b05f00af25';
      templateName = 'Candidate form consent form reminder';
    } else if (type === 'submit') {
      templateId = '1492dd03-75b1-45e3-af19-875b7c1bdf11';
      templateName = 'Candidate form consent form submit';
    }

    if (!templateId || !templateName) return null;

    return {
      email: application.personalDetails.email,
      replyTo: exerciseMailbox,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseName: application.exerciseName,
        dueDate,
        urlRequired: `${CONSTANTS.APPLY_URL}/sign-in`,
        applicantName: application.personalDetails.fullName,
        selectionExerciseManager: exerciseManagerName,
        exerciseMailbox,
      },
      reference: {
        collection: 'applications',
        id: application.id,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationUserInvitation(firebase, userInvitationId, userInvitation) {
    return {
      email: userInvitation.email,
      replyTo: '',
      template: {
        name: 'New user invitation confirmation',
        id: '4f221946-629e-468d-a83e-dec3d4d3d7d2',
      },
      personalisation: {
        username: userInvitation.email,
        email: userInvitation.email,
      },
      reference: {
        collection: 'userInvitations',
        id: userInvitationId,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  function newNotificationPublishedFeedbackReport(firebase, email, exerciseName, testType) {
    const templateName = 'Generic Feedback Report Publication';
    const templateId = 'f74f3fda-419a-4c78-ad15-fbe0e33656ee';
    const reportsLink = 'https://judicialappointments.gov.uk/feedback-and-evaluation-reports#OnlineTests';
    return {
      email: email,
      replyTo: '',
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        exerciseName: exerciseName,
        testType: testType,
        reportsLink: reportsLink,
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'ready',
    };
  }

  /**
   * Send email verification link ** on change of email address **
   * (Note that this is not used for sending the verification link on sign up)
   * 
   * @param {*} email 
   * @param {*} verificationLink 
   * @returns 
   */
  function newNotificationEmailVerificationLink(firebase, email, verificationLink) {
    const templateName = 'Change Email Address Verification Link';
    const templateId = 'e61ecb33-511e-403e-b633-652f94a19e43';
    return {
      email: email,
      replyTo: '',
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        verificationLink: verificationLink,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

  /**
   * Send sms notification for login device confirmation
   * @param {*} firebase 
   * @param {*} intlMobileNumber 
   * @param {*} verificationNumber 
   * @returns 
   */
  function newSmsNotificationLoginVerificationNumber(firebase, intlMobileNumber, verificationNumber) {
    const templateName = 'Login Verification Number';
    const templateId = '18407df7-f669-4b72-9cab-3115bb66563d';
    return {
      messageType: 'sms',
      mobile: intlMobileNumber,
      template: {
        name: templateName,
        id: templateId,
      },
      personalisation: {
        verificationNumber: verificationNumber,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }
};

import { getDocument, getDocuments, getDocumentsFromQueries, applyUpdates } from '../../shared/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import initTaskHelpers from './taskHelpers.js';
import initRefreshApplicationCounts from '../exercises/refreshApplicationCounts.js';
import initFactories from '../../shared/factories.js';
import initQts from '../../shared/qts.js';
import { getOverride } from './meritListHelper.js';
import { GRADES, GRADE_VALUES, markingScheme2ScoreSheet } from '../../shared/scoreSheetHelper.js';
import { TASK_STATUS, PANEL_STATUS, TASK_TYPE, CANDIDATE_FORM_STATUS } from '../../shared/config.js';

export default (qtKey, firebase, db) => {
  const {
    taskStatuses,
    taskNextStatus,
    finaliseScoreSheet,
    getScoreSheetTotal,
    hasOverallGrade,
    getOverallGrade,
    createMarkingScheme,
    //scoreSheet,
    getEmptyScoreSheet,
    scoreSheet2MarkingScheme,
    getApplicationPassStatus,
    getApplicationFailStatus,
    getApplicationDidNotParticipateStatus,
    getApplicationPassStatuses,
    getApplicationFailStatuses,
    //taskApplicationsEntryStatus,
    includeZScores,
  } = initTaskHelpers();

  const { refreshApplicationCounts } = initRefreshApplicationCounts(firebase, db);
  const { newCandidateFormResponse } = initFactories();

  return {
    updateTask,
    getApplications,
    initialisePanelTask,
    initialiseTestTask,
    initialiseStatusChangesTask,
    initialiseCandidateFormTask,
    initialiseDataTask,
    initialiseStageOutcomeTask,
  };

  /**
  * updateTask
  * Updates/progresses a task to the next step, providing all required data is available
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  */
  async function updateTask(params) {
    let result = {
      success: false,
      data: {},
    };

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`), true);
    if (!exercise) return result;

    // get task
    const taskRef = db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`);
    const task = await getDocument(taskRef);
    if (!task) return result;

    // check current status
    const possibleStatuses = taskStatuses(params.type);
    if (possibleStatuses.indexOf(task.status) < 0) return result;

    // get next status
    console.log('status', task.status);
    let nextStatus = taskNextStatus(params.type, task.status);
    console.log('nextStatus', nextStatus);

    // update task
    switch (nextStatus) {
    case TASK_STATUS.PANELS_INITIALISED:
      if (task.type === TASK_TYPE.SCENARIO) {
        result = await initialisePanelTaskForScenario(exercise, task);
      } else {
        result = await initialisePanelTask(exercise, { task: task });
      }
      break;
    case TASK_STATUS.PANELS_ACTIVATED:
      result = await activatePanelTask(exercise, task);
      break;
    case TASK_STATUS.TEST_ACTIVATED:
      result = await activateTestTask(exercise, task);
      break;
    case TASK_STATUS.CANDIDATE_FORM_CONFIGURE:
      result = await initialiseCandidateFormTask(exercise, task.type);
      break;
    case TASK_STATUS.CANDIDATE_FORM_MONITOR:
      result = await monitorCandidateFormTask(exercise, task);
      break;
    case TASK_STATUS.DATA_INITIALISED:
      result = await initialiseDataTask(exercise, task.type);
      break;
    case TASK_STATUS.DATA_ACTIVATED:
      result = await activateDataTask(exercise, task);
      break;
    case TASK_STATUS.MODERATION_INITIALISED:
      result = await initialiseModerationTask(exercise, task);
      break;
    case TASK_STATUS.MODERATION_ACTIVATED:
      result = await activateModerationTask(exercise, task);
      break;
    case TASK_STATUS.FINALISED:
      switch (task.status) {
      case TASK_STATUS.PANELS_ACTIVATED:
        result = await finalisePanelTask(exercise, task);
        break;
      case TASK_STATUS.TEST_ACTIVATED:
        result = await finaliseTestTask(exercise, task);
        break;
      case TASK_STATUS.DATA_ACTIVATED:
        result = await finaliseDataTask(exercise, task);
        break;
      }
      break;
    case TASK_STATUS.STAGE_OUTCOME:
      result = await initialiseStageOutcomeTask(exercise, task.type);
      break;
    case TASK_STATUS.COMPLETED:
      switch (task.status) {
      case TASK_STATUS.STATUS_CHANGES:
        result = await completeStatusChangesTask(exercise, task);
        break;
      case TASK_STATUS.STAGE_OUTCOME:
        result = await completeStageOutcomeTask(exercise, task, params.nextStage);
        break;
      case TASK_STATUS.CANDIDATE_FORM_MONITOR:
        result = await completeCandidateFormTask(exercise, task);
        break;
      default:
        result = await completeTask(exercise, task);
      }
      break;
    }

    // process result
    if (result.success) {
      const taskData = {};
      taskData['status'] = nextStatus;
      taskData[`statusLog.${nextStatus}`] = firebase.firestore.FieldValue.serverTimestamp();
      Object.assign(taskData, result.data);
      const commands = [];
      commands.push({
        command: 'update',
        ref: taskRef,
        data: taskData,
      });
      await applyUpdates(db, commands);
    }

    // return
    return result;
  }

  /**
   * Initialises a status changes task
   * @param {*} exercise
   * @param {*} taskType
   * @param {*} applicationRecords
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
   async function initialiseStatusChangesTask(exercise, taskType, applicationRecords) {
    const result = {
      success: false,
      data: {},
    };
    // get applications data
    const outcomeMap = {};
    const applications = applicationRecords.map(applicationRecord => {
      outcomeMap[applicationRecord.application.id] = null;
      return {
        id: applicationRecord.application.id,
        ref: applicationRecord.application.referenceNumber,
        candidateId: applicationRecord.candidate.id,
        fullName: applicationRecord.candidate.fullName,
      };
    });
    result.success = true;
    result.data.outcomeMap = outcomeMap;
    result.data.applications = applications;
    result.data.applicationPassStatuses = getApplicationPassStatuses(taskType);
    result.data.applicationFailStatuses = getApplicationFailStatuses(taskType);
    return result;
  }

  /**
   * Initialises a panel task by updating application records with placeholder for panelId
   * @param {*} exercise
   * @param {*} params  object with the following optional properties: `task`, `type`, `applicationRecords`
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialisePanelTask(exercise, params) {
    const result = {
      success: false,
      data: {},
    };
    let task;
    let taskType;
    let applicationRecords;
    if (params.task) {
      task = params.task;
      taskType = task.type;
      applicationRecords = task.applications || params.applicationRecords;
      if (!applicationRecords) applicationRecords = await getApplications(exercise, task);
    }
    if (params.taskType) taskType = params.taskType;
    if (params.applicationRecords) applicationRecords = params.applicationRecords;

    // update application records with placeholder for panelId
    if (applicationRecords) {
      const commands = [];
      applicationRecords.forEach(applicationRecord => {
        const data = {};
        data[`${taskType}.panelId`] = null;
        commands.push({
          command: 'update',
          ref: db.collection('applicationRecords').doc(applicationRecord.id),
          data: data,
        });
      });
      await applyUpdates(db, commands);
    }

    result.success = true;
    result.data.grades = GRADES;
    if (task && applicationRecords) result.data['_stats.totalApplications'] = applicationRecords.length;
    if (!task || (task && !task.markingScheme)) {
      result.data.markingScheme = createMarkingScheme(exercise, taskType);
      result.data.emptyScoreSheet = markingScheme2ScoreSheet(result.data.markingScheme); // scoreSheet({ type: taskType, exercise: exercise });
    }
    return result;
  }

  /**
   * Initialises a panel task following scenario test
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialisePanelTaskForScenario(exercise, task) {
    const result = {
      success: false,
      data: {},
    };

    // get test
    const qts = initQts(qtKey);
    const response = await qts.get('scores', {
      testId: task.test.id,
    });
    if (!response.success) return { success: false, message: response.message };
    if (!response.questionIds) return { success: false, message: 'No question ids available' };

    // update application records with placeholder for panelId
    const commands = [];
    task.applications.forEach(application => {
      const data = {};
      data[`${task.type}.panelId`] = null;
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(application.id),
        data: data,
      });
    });
    await applyUpdates(db, commands);

    result.success = true;
    result.data.emptyScoreSheet = getEmptyScoreSheet(response.questionIds);
    result.data.markingScheme = scoreSheet2MarkingScheme(result.data.emptyScoreSheet);
    result.data['test.questionIds'] = response.questionIds;
    // TODO? get status of test so we know whether any candidates did not take the test
    return result;
  }

  /**
   * activatePanelTask
   * Activates panel task by updating relevant panels with application, panellist and task data
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function activatePanelTask(exercise, task) {
    // TODO handle errors (e.g. with try catch)
    const result = {
      success: false,
      data: {},
    };
    // get panels
    const panels = await getDocuments(
      db.collection('panels')
      .where('exercise.id', '==', exercise.id)
      .where('type', '==', task.type)
      .where('applicationIds', '!=', '')
      .select('panellistIds', 'applicationIds')
    );
    if (!panels.length) return result;
    const panelIds = panels.map(panel => panel.id);

    // get relevant panellists
    let panellists = [];
    const panellistIds = [].concat(...panels.map(panel => panel.panellistIds || []));
    if (panellistIds.length) {
      const queries = panellistIds.map(panellistId => {
        return db
          .collection('panellists')
          .where(firebase.firestore.FieldPath.documentId(), '==', panellistId)
          .select('fullName');
      });
      panellists = await getDocumentsFromQueries(queries);
    }
    if (!panellists.length) return result;

    // get relevant application records
    let applicationRecords = [];
    const applicationIds = [].concat(...panels.map(panel => panel.applicationIds || []));
    if (applicationIds.length) {
      applicationRecords = await getDocumentsFromQueries(
        applicationIds.map(applicationId => {
          return db
            .collection('applicationRecords')
            .where(firebase.firestore.FieldPath.documentId(), '==', applicationId)
            .select('application');
        })
      );
    } else {
      return result;
    }

    // update panels
    const commands = [];
    panels.forEach(panel => {
      const data = {
        applications: {},
        panellists: {},
        markingScheme: task.markingScheme,
        hasModeration: panelIds.length > 1,
        scoreSheet: {},
        status: PANEL_STATUS.CREATED,
      };
      if (task.grades) {
        data.grades = task.grades;
        data.grade_values = GRADE_VALUES;
      }
      data[`statusLog.${PANEL_STATUS.CREATED}`] = firebase.firestore.FieldValue.serverTimestamp();

      const relevantApplicationRecords = applicationRecords.filter(applicationRecord => panel.applicationIds.indexOf(applicationRecord.id) >= 0);
      relevantApplicationRecords.forEach(applicationRecord => {
        data.applications[applicationRecord.id] = {
          referenceNumber: applicationRecord.application.referenceNumber,
          // TODO include fullName for non name-blind
        };
        data.scoreSheet[applicationRecord.id] = task.emptyScoreSheet;
      });

      const relevantPanellists = panellists.filter(panellist => panel.panellistIds.indexOf(panellist.id) >= 0);
      relevantPanellists.forEach(panellist => {
        data.panellists[panellist.id] = {
          fullName: panellist.fullName,
          // TODO include other details e.g. phone, email?
        };
      });

      commands.push({
        command: 'update',
        ref: db.collection('panels').doc(panel.id),
        data: data,
      });
    });

    await applyUpdates(db, commands);

    result.success = true;
    result.data.panelIds = panelIds;

    return result;
  }

  /**
   * Initialises a test on the QT Platform.
   * @param {*} folderName
   * @param {*} testType
   * @param {*} startDate
   * @param {*} endDate
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialiseTestTask(folderName, testType, startDate, endDate) {
    const result = {
      success: false,
      data: {},
    };
    const title = `${lookup(testType)} for ${folderName}`;
    const QTType = testType === TASK_TYPE.EMP_TIEBREAKER ? TASK_TYPE.SCENARIO : testType;
    // initialise test on QT Platform
    const qts = initQts(qtKey);
    const response = await qts.post('qualifying-test', {
      folder: folderName,
      test: {
        type: QTType,
        startDate: startDate,
        endDate: endDate,
        title: title,
      },
    });
    result.success = true;
    result.data.folderId = response.folderId;
    result.data.test = {
      id: response.testId,
    };
    return result;
  }

  /**
   * activateTestTask
   * Activates a test task by transfering participants to QT Platform, enabling the test to be taken
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function activateTestTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };

    // get applications
    const applications = await getApplications(exercise, task);
    if (!applications.length) { result.message = 'No applications'; return result; }

    // participants
    const participants = applications.map(application => {
      return {
        srcId: application.id,
        ref: application.ref,
        email: application.email,
        fullName: application.fullName,
        adjustments: application.adjustments,
      };
    });

    // send participants to QT Platform
    const qts = initQts(qtKey);
    await qts.post('participants', {
      testId: task.test.id,
      participants: participants,
    });

    // save applications in task document
    result.success = true;
    result.data.applications = applications;
    return result;

  }

  /**
   * initialiseStageOutcomeTask
   * Initialises a data task. Currently does nothing!
   * @param {*} exercise
   * @param {*} taskType
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialiseStageOutcomeTask(exercise, taskType) {
    console.log('initialiseStageOutcomeTask', taskType);
    const result = {
      success: false,
      data: {},
    };
    result.success = true;
    // TODO do we need to include anything here? e.g. applications
    return result;
  }


  /**
   * initialiseCandidateFormTask
   * Initialises a candidate data task. Currently does nothing!
   * @param {*} exercise
   * @param {*} taskType
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialiseCandidateFormTask(exercise, taskType) {
    console.log('initialiseCandidateFormTask', taskType);
    const result = {
      success: false,
      data: {},
    };

    // create candidateForm
    const saveData = {
      exercise: {
        id: exercise.id,
      },
      task: {
        type: taskType,
      },
      openDate: exercise.preSelectionDayQuestionnaireSendDate,
      closeDate: exercise.preSelectionDayQuestionnaireReturnDate,
      parts: [],
      status: CANDIDATE_FORM_STATUS.CREATED,
      statusLog: {},
      candidateAvailabilityDates: [],
    };

    exercise.selectionDays.forEach(item => {
      const location = item.selectionDayLocation;
      const startDate = item.selectionDayStart;
      const endDate = item.selectionDayEnd;
      const dates = excludeWeekends(dateRange(startDate, endDate));
      dates.forEach(date => saveData.candidateAvailabilityDates.push({ date: date, location: location }));
    });

    saveData.statusLog[CANDIDATE_FORM_STATUS.CREATED] = firebase.firestore.FieldValue.serverTimestamp();
    const candidateForm = await db.collection('candidateForms').add(saveData);

    result.success = true;
    result.data.formId = candidateForm.id;
    return result;
  }

  /**
   * Get dates between two dates
   * Optionally specify a step size (in days)
   * @param {*} startDate
   * @param {*} endDate
   * @param {*} steps
   * @returns
   */
  function dateRange(startDate, endDate, steps = 1) {
    const dateArray = [];
    const currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      dateArray.push(new Date(currentDate));
      // Use UTC date to prevent problems with time zones and DST
      currentDate.setUTCDate(currentDate.getUTCDate() + steps);
    }
    return dateArray;
  }

  function excludeWeekends(dates) {
    return dates.filter(item => item.getDay() > 0 && item.getDay() < 6);
  }

  /**
   * initialiseDataTask
   * Initialises a data task.
   * @param {*} exercise
   * @param {*} taskType
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialiseDataTask(exercise, taskType) {
    console.log('initialiseDataTask', taskType);
    const result = {
      success: false,
      data: {},
    };
    result.success = true;
    result.data.grades = GRADES;
    result.data.markingScheme = createMarkingScheme(exercise, taskType);
    result.data.emptyScoreSheet = markingScheme2ScoreSheet(result.data.markingScheme);  // scoreSheet({ type: taskType, exercise: exercise });
    return result;
  }

  async function getApplications(exercise, task) {
    const applicationsData = [];
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', exercise.id)
      .where('status', '==', 'applied');
    if (task.applicationEntryStatus) {
      applicationsRef = applicationsRef.where('_processing.status', '==', task.applicationEntryStatus);
      console.log('get applications with status', task.applicationEntryStatus);
    }
    const applications = await getDocuments(applicationsRef);
    if (!applications) return applicationsData;
    applications.forEach(application => {
      if (application.personalDetails) {
        applicationsData.push({
          id: application.id,
          ref: application.referenceNumber,
          email: application.personalDetails.email || '',
          fullName: application.personalDetails.fullName || '',
          adjustments: application.personalDetails.reasonableAdjustments || false,
        });
      }
    });
    return applicationsData;
  }

  /**
   * monitorCandidateFormTask
   * Starts monitoring candidate forms
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function monitorCandidateFormTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };

    // get candidateForm
    const candidateForm = await getDocument(db.collection('candidateForms').doc(task.formId));
    if (!candidateForm) { result.message = 'No candidate form'; return result; }

    // get applications
    let applicationsRef = db.collection('applications')
    .where('exerciseId', '==', exercise.id)
    .where('status', '==', 'applied');
    if (task.applicationEntryStatus) {
      applicationsRef = applicationsRef.where('_processing.status', '==', task.applicationEntryStatus);
    }
    const applications = await getDocuments(applicationsRef);
    if (!applications.length) { result.message = 'No applications'; return result; }

    // create candidate form responses and update application records
    const commands = [];
    const candidateIds = [];
    applications.forEach(application => {
      candidateIds.push(application.userId);
      const newResponse = newCandidateFormResponse(firebase, candidateForm.id, task.type, application.id);
      commands.push({
        command: 'set',
        ref: db.collection(`candidateForms/${candidateForm.id}/responses`).doc(application.userId),
        data: newResponse,
      });
      const appplicationRecordData = {};
      appplicationRecordData[task.type] = { status: newResponse.status };
      // store status both in application and applicationRecord
      commands.push({
        command: 'update',
        ref: db.collection('applications').doc(application.id),
        data: appplicationRecordData,
      });
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(application.id),
        data: appplicationRecordData,
      });
    });

    // update candidate form
    commands.push({
      command: 'update',
      ref: candidateForm.ref,
      data: {
        candidateIds: candidateIds,
      },
    });

    await applyUpdates(db, commands);

    result.success = true;
    return result;
  }

  /**
   * activateDataTask
   * Activates a data task.
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function activateDataTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };

    // get applications
    result.data.applications = await getApplications(exercise, task);
    if (!result.data.applications.length) { result.message = 'No applications'; return result; }

    // get scoresheet
    let emptyScoreSheet = task.emptyScoreSheet;
    if (task.type === TASK_TYPE.SCENARIO || task.type === TASK_TYPE.EMP_TIEBREAKER) {
      // get test
      const qts = initQts(qtKey);
      const response = await qts.get('scores', {
        testId: task.test.id,
      });
      if (!response.success) return { success: false, message: response.message };
      if (!response.questionIds) return { success: false, message: 'No question ids available' };

      result.data.emptyScoreSheet = getEmptyScoreSheet(response.questionIds);
      result.data.markingScheme = scoreSheet2MarkingScheme(result.data.emptyScoreSheet);
      result.data['test.questionIds'] = response.questionIds;
      emptyScoreSheet = result.data.emptyScoreSheet;
    }

    // populate scoreSheet
    result.data.scoreSheet = {};
    result.data.applications.forEach(application => {
      result.data.scoreSheet[application.id] = emptyScoreSheet;
    });
    result.success = true;
    return result;
  }

  /**
   * initialiseModerationTask
   * Initialise moderation task. Currently does nothing!
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialiseModerationTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };
    // TODO check if we need to return anything here
    result.success = true;
    return result;
  }

  /**
   * activateModerationTask
   * Activate moderation task. Currently does nothing!
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function activateModerationTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };
    // TODO check if we need to return anything here
    result.success = true;
    return result;
  }

  /**
   * finalisePanelTask
   * Finalise panel task. Constructs `finalScores` to be added to `task` document
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function finalisePanelTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };
    // get panels
    const panelQueries = task.panelIds.map(panelId => {
      return  db.collection('panels')
        .where(firebase.firestore.FieldPath.documentId(), '==', panelId)
        .select('scoreSheet', 'applicationIds', 'applications');
    });
    const panels = await getDocumentsFromQueries(panelQueries);

    const hasGrade = hasOverallGrade(task);

    // construct final scores
    // TODO change to `.applications` and `.scores`
    const finalScores = [];
    panels.forEach(panel => {
      panel.applicationIds.forEach(applicationId => {
        const row = {
          id: applicationId,
          ref: panel.applications[applicationId].referenceNumber, // TODO extract only the last 7 chars
          panelId: panel.id,
          scoreSheet: finaliseScoreSheet(task.markingScheme, panel.scoreSheet[applicationId]),
          changes: task.changes && task.changes[applicationId] ? task.changes[applicationId] : {},
        };
        row.score = getScoreSheetTotal(task.markingScheme, panel.scoreSheet[applicationId], row.changes);
        if (hasGrade) {
          row.grade = getOverallGrade(task, panel.scoreSheet[applicationId], row.changes);
          // row.gradeScore = `${GRADE_VALUES[row.grade]}_${row.score}`;
          row.gradeScore = `${row.grade}:${row.score}`;
          row.scoreType = 'gradeScore';
        }
        finalScores.push(row);
      });
    });

    result.success = true;
    result.data.finalScores = finalScores;
    return result;
  }

  /**
   * finaliseTestTask
   * Finalise test task. Constructs `finalScores` to be added to `task` document
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function finaliseTestTask(exercise, task) {
    console.log('finaliseTestTask');
    const result = {
      success: false,
      data: {},
    };

    // get results from QT Platform
    const qts = initQts(qtKey);
    const response = await qts.get('scores', {
      testId: task.test.id,
    });
    if (!response.success) return { success: false, message: response.message };
    if (!response.scores) return { success: false, message: 'No scores available' };
    if (!response.maxScore) return { success: false, message: 'No max score available' };
    if (!Object.keys(response.scores).length) return { success: false, message: 'No scores available' };

    // construct finalScores
    const finalScores = [];
    task.applications.forEach(application => {
      if (response.scores[application.id]) {
        finalScores.push({
          id: application.id,
          ref: application.ref,
          score: response.scores[application.id],
          percent: 100 * (response.scores[application.id] / response.maxScore),
        });
      }
    });
    result.success = true;
    result.data.maxScore = response.maxScore;
    result.data.finalScores = finalScores;
    return result;
  }

  /**
   * finaliseDataTask
   * Finalise data entry task. Constructs `finalScores` to be added to `task` document
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function finaliseDataTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };

    // construct final scores
    const finalScores = [];
    task.applications.forEach(application => {
      const row = {
        id: application.id,
        ref: application.ref,
        scoreSheet: finaliseScoreSheet(task.markingScheme, task.scoreSheet[application.id]),
        score: getScoreSheetTotal(task.markingScheme, task.scoreSheet[application.id]),
      };
      finalScores.push(row);
    });

    result.success = true;
    result.data.finalScores = finalScores;
    // TODO remove un-necessary fields
    return result;
  }

  /**
   * completeCandidateFormTask
   * Completes a candidate data entry task.
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function completeCandidateFormTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };

    // get candidateForm
    const candidateForm = await getDocument(db.collection('candidateForms').doc(task.formId));
    if (!candidateForm) { result.message = 'No candidate form'; return result; }

    // get responses
    const responses = await getDocuments(db.collection('candidateForms').doc(task.formId).collection('responses'));
    if (!responses.length) { result.message = 'No responses'; return result; }

    // populate stats
    const stats = {};
    stats.completed = 0;
    stats.notCompleted = 0;
    responses.forEach(response => response.status === 'completed' ? stats.completed++: stats.notCompleted++ );

    result.success = true;
    result.data._stats = { ...task._stats, ...stats };

    return result;
  }


  /**
   * completeTask
   * Completes a task.
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function completeTask(exercise, task) {

    const result = {
      success: false,
      data: {},
    };
    if (!Object.prototype.hasOwnProperty.call(task, 'passMark')) return result;

    const scoreType = task.scoreType ? task.scoreType : 'score';
    const outcomeStats = {};
    const passStatus = getApplicationPassStatus(exercise, task);
    const failStatus = getApplicationFailStatus(exercise, task);
    const didNotParticipateStatus = getApplicationDidNotParticipateStatus(exercise, task);
    outcomeStats[passStatus] = 0;
    outcomeStats[failStatus] = 0;
    if (didNotParticipateStatus) outcomeStats[didNotParticipateStatus] = 0;

    // get applications still relevant to this task
    const applications = await getApplications(exercise, task);
    const applicationIdMap = {};
    applications.forEach(application => applicationIdMap[application.id] = true);

    // update application records (only those still relevant)
    const commands = [];
    task.finalScores.filter(scoreData => applicationIdMap[scoreData.id]).forEach(scoreData => {
      let newStatus;
      if (scoreType === 'gradeScore') {
        let isPass = false;
        const passParts = task.passMark.split(':');
        if (scoreData.grade < passParts[0]) {
          isPass = true;
        } else if (scoreData.grade > passParts[0]) {
          isPass = false;
        } else if (scoreData.score >= parseInt(passParts[1])) {
          isPass = true;
        }
        newStatus = isPass ? passStatus : failStatus;
      } else if (scoreData[scoreType] >= task.passMark) {
        newStatus = passStatus; // TODO double-check we don't want to allow overrides from PASS->FAIL
      } else {
        const override = getOverride(task, scoreData.id);
        if (override) {
          newStatus = passStatus;
        } else {
          newStatus = failStatus;
        }
      }
      outcomeStats[newStatus] += 1;
      scoreData.pass = newStatus === passStatus ? true : false;
      const saveData = {};
      if (!(task.allowStatusUpdates === false)) { saveData.status = newStatus; }  // here we update status unless this has been explicitly denied
      saveData[`statusLog.${newStatus}`] = firebase.firestore.FieldValue.serverTimestamp(); // we still always log the status change
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(scoreData.id),
        data: saveData,
      });
    });

    // update application records where we don't have final scores (if we have a status to set these to)
    if (didNotParticipateStatus) {
      const scoredApplicationIdMap = {};
      task.finalScores.forEach(scoreData => scoredApplicationIdMap[scoreData.id] = true);
      applications.filter(application => applicationIdMap[application.id]).filter(application => !scoredApplicationIdMap[application.id]).forEach(application => {
        outcomeStats[didNotParticipateStatus] += 1;
        const saveData = {};
        if (!(task.allowStatusUpdates === false)) { saveData.status = didNotParticipateStatus; }  // here we update status unless this has been explicitly denied
        saveData[`statusLog.${didNotParticipateStatus}`] = firebase.firestore.FieldValue.serverTimestamp(); // we still always log the status change
        commands.push({
          command: 'update',
          ref: db.collection('applicationRecords').doc(application.id),
          data: saveData,
        });
      });
    }

    // check for qualifying test follow on task
    if (task.type === TASK_TYPE.CRITICAL_ANALYSIS || task.type === TASK_TYPE.SITUATIONAL_JUDGEMENT) {
      if (
        exercise.shortlistingMethods.indexOf('critical-analysis-qualifying-test') >= 0 && exercise.criticalAnalysisTestDate
        && exercise.shortlistingMethods.indexOf('situational-judgement-qualifying-test') >= 0 && exercise.situationalJudgementTestDate
      ) {
        // get the other QT task
        const otherTaskType = task.type === TASK_TYPE.CRITICAL_ANALYSIS ? TASK_TYPE.SITUATIONAL_JUDGEMENT : TASK_TYPE.CRITICAL_ANALYSIS;
        const otherTask = await getDocument(db.doc(`exercises/${exercise.id}/tasks/${otherTaskType}`));
        if (otherTask.status === TASK_STATUS.COMPLETED) {
          // create qualifying test task
          const finalScores = [];
          const applications = [];
          task.finalScores.filter(scoreData => applicationIdMap[scoreData.id]).forEach(scoreData => {
            if (scoreData.pass) {
              const otherTaskScoreData = otherTask.finalScores.find(otherScoreData => otherScoreData.id === scoreData.id);
              if (otherTaskScoreData && otherTaskScoreData.pass) {
                const CAData = task.type === TASK_TYPE.CRITICAL_ANALYSIS ? scoreData : otherTaskScoreData;
                const SJData = task.type === TASK_TYPE.CRITICAL_ANALYSIS ? otherTaskScoreData : scoreData;
                finalScores.push({
                  id: scoreData.id,
                  ref: scoreData.ref,
                  score: CAData.score + SJData.score,
                  scoreSheet: {
                    qualifyingTest: {
                      CA: {
                        score: CAData.score,
                        percent: CAData.percent,
                      },
                      SJ: {
                        score: SJData.score,
                        percent: SJData.percent,
                      },
                      score: CAData.score + SJData.score,
                    },
                  },
                });
                const application = task.applications.find(application => application.id === scoreData.id);
                if (application) {
                  applications.push(application);
                }
              } else {
                // update application record status to failed first test
                outcomeStats[failStatus] += 1;
                const saveData = {};
                if (!(task.allowStatusUpdates === false)) { saveData.status = failStatus; }  // here we update status unless this has been explicitly denied
                saveData[`statusLog.${failStatus}`] = firebase.firestore.FieldValue.serverTimestamp(); // we still always log the status change
                commands.push({
                  command: 'update',
                  ref: db.collection('applicationRecords').doc(scoreData.id),
                  data: saveData,
                });
              }
            }
          });

          const taskData = {
            _stats: {
              totalApplications: finalScores.length,
            },
            applications: applications,
            scoreType: 'zScore',
            finalScores: includeZScores(finalScores),
            markingScheme: [
              {
                ref: TASK_TYPE.QUALIFYING_TEST,
                type: 'group',
                children: [
                  {
                    ref: 'CA',
                    type: 'score',
                  },
                  {
                    ref: 'SJ',
                    type: 'score',
                  },
                ],
              },
            ],
            type: TASK_TYPE.QUALIFYING_TEST,
          };
          taskData['status'] = TASK_STATUS.FINALISED;
          taskData.statusLog = {};
          taskData.statusLog[TASK_STATUS.FINALISED] = firebase.firestore.FieldValue.serverTimestamp();
          commands.push({
            command: 'set',
            ref: db.doc(`exercises/${exercise.id}/tasks/${TASK_TYPE.QUALIFYING_TEST}`),
            data: taskData,
          });
        }
      }
    }

    await applyUpdates(db, commands);
    result.success = true;
    result.data['_stats.totalForEachOutcome'] = outcomeStats;
    result.data.finalScores = task.finalScores; // includes `pass: Boolean` for each entry in `finalScores`

    return result;
  }

  /**
   * completeStatusChangesTask
   * Completes a status changes task.
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
   async function completeStatusChangesTask(exercise, task) {
    console.log('complete status change task');
    const result = {
      success: false,
      data: {},
    };
    if (!task.outcomeMap) return result;
    if (!task.applicationPassStatuses) return result;
    if (!task.applicationFailStatuses) return result;

    // prepare outcome stats
    const outcomeStats = {};
    task.applicationPassStatuses.forEach(status => outcomeStats[status] = 0);
    task.applicationFailStatuses.forEach(status => outcomeStats[status] = 0);

    // update application records
    const commands = [];
    task.applications.forEach(application => {
      const saveData = {};
      const newStatus = task.outcomeMap[application.id];
      outcomeStats[newStatus] += 1;
      saveData.status = newStatus;
      saveData[`statusLog.${newStatus}`] = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(application.id),
        data: saveData,
      });
    });
    await applyUpdates(db, commands);

    result.success = true;
    result.data['_stats.totalForEachOutcome'] = outcomeStats;

    return result;
  }

  /**
   * completeStageOutcomeTask
   * Completes a stage outcome task by updating the Stage of all successfull applications (other apps remain unchanged)
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function completeStageOutcomeTask(exercise, task, nextStage) {
    const result = {
      success: false,
      data: {},
    };

    // get successfull application records
    const applicationRecords = await getDocuments(
      db.collection('applicationRecords')
      .where('exercise.id', '==', exercise.id)
      .where('status', '==', task.applicationEntryStatus)
      .select()
    );

    // get next status
    const nextApplicationStatus = getApplicationPassStatus(exercise, task);

    const outcomeStats = {};
    outcomeStats[nextApplicationStatus] = 0;
    // TODO get stats for other statuses in this stage

    // update successfull appplication records
    const commands = [];
    applicationRecords.forEach(applicationRecord => {
      const saveData = {};
      outcomeStats[nextApplicationStatus] += 1;
      saveData.stage = nextStage;
      saveData[`stageLog.${nextStage}`] = firebase.firestore.FieldValue.serverTimestamp();
      saveData.status = nextApplicationStatus;
      saveData[`stageLog.${nextApplicationStatus}`] = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(applicationRecord.id),
        data: saveData,
      });
    });
    await applyUpdates(db, commands);

    await refreshApplicationCounts({ exerciseId: exercise.id });

    // return data to be saved in `task` document
    result.success = true;
    result.data['_stats.totalForEachOutcome'] = outcomeStats;
    return result;
  }

};

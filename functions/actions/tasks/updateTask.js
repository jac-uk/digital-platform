const { getDocument, getDocuments, getDocumentsFromQueries, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const {
    taskStatuses,
    taskNextStatus,
    finaliseScoreSheet,
    getScoreSheetTotal,
    createMarkingScheme,
    scoreSheet,
    getEmptyScoreSheet,
    scoreSheet2MarkingScheme,
    getApplicationPassStatuses,
    getApplicationFailStatuses,
    taskApplicationsEntryStatus,
  } = require('./taskHelpers')(config);

  return {
    updateTask,
    initialisePanelTask,
    initialiseTestTask,
    initialiseStatusChangesTask,
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
    let nextStatus = taskNextStatus(params.type, task.status);
    console.log('nextStatus', nextStatus);

    // update task
    switch (nextStatus) {
    case config.TASK_STATUS.PANELS_INITIALISED:
      if (task.type === config.TASK_TYPE.SCENARIO) {
        result = await initialisePanelTaskForScenario(exercise, task);
      } else {
        result = await initialisePanelTask(exercise, task.type, task.applications);
      }
      break;
    case config.TASK_STATUS.PANELS_ACTIVATED:
      result = await activatePanelTask(exercise, task);
      break;
    case config.TASK_STATUS.TEST_ACTIVATED:
      result = await activateTestTask(exercise, task);
      break;
    case config.TASK_STATUS.DATA_ACTIVATED:
      result = await activateDataTask(exercise, task);
      break;
    case config.TASK_STATUS.MODERATION_INITIALISED:
      result = await initialiseModerationTask(exercise, task);
      break;
    case config.TASK_STATUS.MODERATION_ACTIVATED:
      result = await activateModerationTask(exercise, task);
      break;
    case config.TASK_STATUS.FINALISED:
      switch (task.status) {
      case config.TASK_STATUS.PANELS_ACTIVATED:
        result = await finalisePanelTask(exercise, task);
        break;
      case config.TASK_STATUS.TEST_ACTIVATED:
        result = await finaliseTestTask(exercise, task);
        break;
      }
      break;
    case config.TASK_STATUS.CHECKS: // TODO think about naming
      result = await checksTask(exercise, task);
      break;
    case config.TASK_STATUS.COMPLETED:
      switch (task.status) {
      case config.TASK_STATUS.STATUS_CHANGES:
        result = await completeStatusChangesTask(exercise, task);
        break;
      case config.TASK_STATUS.CHECKS:
        result = await completeChecksTask(exercise, task);
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
   * @param {*} taskType
   * @param {*} applicationRecords
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialisePanelTask(exercise, taskType, applicationRecords) {
    const result = {
      success: false,
      data: {},
    };
    // update application records with placeholder for panelId
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
    result.success = true;
    result.data.grades = config.GRADES;
    result.data.markingScheme = createMarkingScheme(exercise, taskType);
    result.data.emptyScoreSheet = scoreSheet({ type: taskType, exercise: exercise });
    return result;
  }

  /**
   * Initialises a panel task following scenario test
   * @param {*} exercise
   * @param {*} taskType
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function initialisePanelTaskForScenario(exercise, task) {
    const result = {
      success: false,
      data: {},
    };

    // get test
    const qts = require('../../shared/qts')(config);
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
        scoreSheet: {},
        status: config.PANEL_STATUS.CREATED,
      };
      if (task.grades) {
        data.grades = task.grades;
        data.grade_values = config.GRADE_VALUES;
      }
      data[`statusLog.${config.PANEL_STATUS.CREATED}`] = firebase.firestore.FieldValue.serverTimestamp();

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
    // initialise test on QT Platform
    const qts = require('../../shared/qts')(config);
    const response = await qts.post('qualifying-test', {
      folder: folderName,
      test: {
        type: testType,
        startDate: startDate,
        endDate: endDate,
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
    let applicationsRef = db.collection('applications')
      .where('exerciseId', '==', exercise.id)
      .where('status', '==', 'applied');
    if (task.applicationEntryStatus) {
      applicationsRef = applicationsRef.where('_processing.status', '==', task.applicationEntryStatus);
    }
    const applications = await getDocuments(applicationsRef);
    if (!applications) return result;

    console.log('applications', applications.length);

    // construct `applications` and `participants`
    const applicationsData = [];
    const participants = [];
    applications.forEach(application => {
      if (application.personalDetails) {
        applicationsData.push({
          id: application.id,
          ref: application.referenceNumber,
          email: application.personalDetails.email || '',
          fullName: application.personalDetails.fullName || '',
          adjustments: application.personalDetails.reasonableAdjustments || false,
        });
        participants.push({
          srcId: application.id,
          ref: application.referenceNumber,
          email: application.personalDetails.email || '',
          fullName: application.personalDetails.fullName || '',
          adjustments: application.personalDetails.reasonableAdjustments || false,
        });
      }
    });

    // send participants to QT Platform
    const qts = require('../../shared/qts')(config);
    await qts.post('participants', {
      testId: task.test.id,
      participants: participants,
    });

    // save applications in task document
    result.success = true;
    result.data.applications = applicationsData;
    return result;

  }

  /**
   * activateDataTask
   * Activates a data task. Currently does nothing!
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
  async function activateDataTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };
    // TODO check if we need to return anything here
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
          score: getScoreSheetTotal(task.markingScheme, panel.scoreSheet[applicationId]),
        };
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
    const qts = require('../../shared/qts')(config);
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
      finalScores.push({
        id: application.id,
        ref: application.ref,
        score: response.scores[application.id],
      });
    });

    result.success = true;
    result.data.finalScores = finalScores;
    result.data.maxScore = response.maxScore;
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
    if (!(task.passMark >= 0)) return result;

    // TODO get statuses from func
    const outcomeStats = {};
    const passStatus = `${task.type}Passed`;
    const failStatus = `${task.type}Failed`;
    outcomeStats[passStatus] = 0;
    outcomeStats[failStatus] = 0;

    // update application records
    const commands = [];
    task.finalScores.forEach(scoreData => {
      let newStatus;
      if (scoreData.score >= task.passMark) {
        newStatus = passStatus;
      } else {
        newStatus = failStatus;
      }
      outcomeStats[newStatus] += 1;
      const saveData = {};
      saveData.status = newStatus;
      // TODO update stage too?
      saveData[`statusLog.${newStatus}`] = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: db.collection('applicationRecords').doc(scoreData.id),
        data: saveData,
      });
    });

    // check for qualifying test follow on task
    if (task.type === config.TASK_TYPE.CRITICAL_ANALYSIS || task.type === config.TASK_TYPE.SITUATIONAL_JUDGEMENT) {
      if (
        exercise.shortlistingMethods.indexOf('critical-analysis-qualifying-test') >= 0 && exercise.criticalAnalysisTestDate
        && exercise.shortlistingMethods.indexOf('situational-judgement-qualifying-test') >= 0 && exercise.situationalJudgementTestDate
      ) {
        // get the other QT task
        const otherTaskType = task.type === config.TASK_TYPE.CRITICAL_ANALYSIS ? config.TASK_TYPE.SITUATIONAL_JUDGEMENT : config.TASK_TYPE.CRITICAL_ANALYSIS;
        const otherTask = await getDocument(db.doc(`exercises/${exercise.id}/tasks/${otherTaskType}`));
        if (otherTask.status === config.TASK_STATUS.COMPLETED) {
          // create qualifying test task
          const finalScores = [];
          task.finalScores.forEach(scoreData => {
            if (scoreData.score >= task.passMark) {
              const otherTaskScoreData = otherTask.finalScores.find(otherScoreData => otherScoreData.id === scoreData.id);
              if (otherTaskScoreData && otherTaskScoreData.score >= otherTask.passMark) {
                const overallScore = 50 * ((scoreData.score / task.maxScore) + (otherTaskScoreData.score / otherTask.maxScore));
                finalScores.push({
                  id: scoreData.id,
                  ref: scoreData.ref,
                  score: overallScore,
                  scoreSheet: {
                    qualifyingTest: {
                      CA: task.type === config.TASK_TYPE.CRITICAL_ANALYSIS ? scoreData.score : otherTaskScoreData.score,
                      SJ: task.type === config.TASK_TYPE.CRITICAL_ANALYSIS ? otherTaskScoreData.score : scoreData.score,
                      score: overallScore,
                    },
                  },
                });
              }
            }
          });

          const taskData = {
            _stats: {
              totalApplications: finalScores.length,
            },
            finalScores: finalScores,
            markingScheme: [
              {
                ref: config.TASK_TYPE.QUALIFYING_TEST,
                type: 'group',
                children: [
                  {
                    ref: 'CA',
                    type: 'number',
                  },
                  {
                    ref: 'SJ',
                    type: 'number',
                  },
                ],
              },
            ],
            type: config.TASK_TYPE.QUALIFYING_TEST,
          };
          taskData['status'] = config.TASK_STATUS.FINALISED;
          taskData.statusLog = {};
          taskData.statusLog[config.TASK_STATUS.FINALISED] = firebase.firestore.FieldValue.serverTimestamp();
          commands.push({
            command: 'set',
            ref: db.doc(`exercises/${exercise.id}/tasks/${config.TASK_TYPE.QUALIFYING_TEST}`),
            data: taskData,
          });
        }
      }
    }

    await applyUpdates(db, commands);
    result.success = true;
    result.data['_stats.totalForEachOutcome'] = outcomeStats;

    return result;
  }


  /**
   * completeChecksTask
   * Completes a checks task.
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
   async function completeChecksTask(exercise, task) {
    console.log('complete checks task');
    const result = {
      success: false,
      data: {},
    };

    // get applications
    const applications = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exercise.id).select('status'));

    // construct stats and update successful application records
    const outcomeStats = {};
    const commands = [];
    const successStatus = taskApplicationsEntryStatus(exercise, task.type);
    const newStatus = getApplicationPassStatuses(task.type)[0];
    applications.forEach(application => {
      if (!outcomeStats[application.status]) outcomeStats[application.status] = 0;
      outcomeStats[application.status] += 1;
      if (application.status === successStatus) {
        const saveData = {};
        saveData.status = newStatus;
        saveData[`statusLog.${newStatus}`] = firebase.firestore.FieldValue.serverTimestamp();
        commands.push({
          command: 'update',
          ref: db.collection('applicationRecords').doc(application.id),
          data: saveData,
        });
      }
    });
    await applyUpdates(db, commands);

    // return data to be saved in `task` document
    result.success = true;
    result.data['_stats.totalForEachOutcome'] = outcomeStats;
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
   * checksTask
   * Checks task. Currently does nothing!
   * @param {*} exercise
   * @param {*} task
   * @returns Result object of the form `{ success: Boolean, data: Object }`. If successful then `data` is to be stored in the `task` document
   */
   async function checksTask(exercise, task) {
    const result = {
      success: false,
      data: {},
    };
    // TODO check if we need to return anything here
    result.success = true;
    return result;
  }

};
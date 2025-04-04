import { getDocument, getDocuments, applyUpdates } from '../../shared/helpers.js';
import initTaskHelpers from './taskHelpers.js';
import initUpdateTask from './updateTask.js';
import { TASK_STATUS, TASK_TYPE } from '../../shared/constants.js';

export default (firebase, db) => {
  const { getTimelineTasks, taskNextStatus, taskApplicationsEntryStatus, hasTaskType } = initTaskHelpers();
  const { getApplications, initialisePanelTask, initialiseTestTask, initialiseStatusChangesTask, initialiseCandidateFormTask, initialiseDataTask, initialiseStageOutcomeTask } = initUpdateTask(firebase, db);

  return createTask;

  /**
  * createTask
  * Creates an exercise processing task - e.g. sift, selection, scenario
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  */
  async function createTask(params) {

    let result = {
      success: false,
      data: {},
    };

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`), true);
    if (!exercise) return result;

    // check if task already exists
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (task) {
      console.log('task already exists');
      return result;
    }

    // get next status
    let nextStatus = taskNextStatus(params.type);
    console.log('nextStatus', nextStatus);

    // get status for eligibile applications
    const applicationEntryStatus = taskApplicationsEntryStatus(exercise, params.type);
    console.log('applicationEntryStatus', applicationEntryStatus);

    // get application records
    // TODO check whether we still need this now we have `applications`
    let applicationRecords = [];
    if (applicationEntryStatus || [TASK_STATUS.PANELS_INITIALISED, TASK_STATUS.STATUS_CHANGES].indexOf(nextStatus)) {
      let queryRef = db.collection('applicationRecords')
        .where('exercise.id', '==', params.exerciseId);
      if (applicationEntryStatus) {
        queryRef = queryRef.where('status', '==', applicationEntryStatus);
      }
      applicationRecords = await getDocuments(queryRef.select('application', 'candidate'));
    }

    // get applications
    const applications = await getApplications(exercise, { applicationEntryStatus });
    if (!applications.length) {
      console.log('No applications');
      return result;
    }

    // get task data from timeline
    const timelineTask = getTimelineTasks(exercise, params.type)[0];

    // construct task document, based on next status
    switch (nextStatus) {
    case TASK_STATUS.PANELS_INITIALISED:
      result = await initialisePanelTask(exercise, { taskType: params.type, applicationRecords: applicationRecords });
      break;
    case TASK_STATUS.TEST_INITIALISED:
      result = await initialiseTestTask(exercise.referenceNumber, params.type, timelineTask.date, timelineTask.endDate);
      break;
    case TASK_STATUS.STATUS_CHANGES:
      result = await initialiseStatusChangesTask(exercise, params.type, applicationRecords);
      break;
    case TASK_STATUS.CANDIDATE_FORM_CONFIGURE:
      result = await initialiseCandidateFormTask(exercise, params.type);
      break;
    case TASK_STATUS.DATA_INITIALISED:
      result = await initialiseDataTask(exercise, params.type);
      break;
    case TASK_STATUS.STAGE_OUTCOME:
      result = await initialiseStageOutcomeTask(exercise, params.type);
      break;
    }

    // task-specific updates
    if (result.success) {
      switch (params.type) {
      case TASK_TYPE.SELECTION_DAY:
        if (hasTaskType(exercise, TASK_TYPE.PRE_SELECTION_DAY_QUESTIONNAIRE)) {
          const psdq = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${TASK_TYPE.PRE_SELECTION_DAY_QUESTIONNAIRE}`));
          if (psdq) {
            result.data[`_${TASK_TYPE.PRE_SELECTION_DAY_QUESTIONNAIRE}`] = {
              formId: psdq.formId,
            };
          }
        }
        break;
      default:
      }
    }

    if (result.success) {
      const taskData = {
        _stats: {},
        startDate: timelineTask.date,
        endDate: timelineTask.endDate ? timelineTask.endDate : timelineTask.date,
        dateString: timelineTask.dateString,
        type: params.type,
      };
      taskData._stats.totalApplications = applications.length;
      taskData.applications = applications;
      taskData.applicationEntryStatus = applicationEntryStatus;
      taskData.status = nextStatus;
      taskData.statusLog = {};
      taskData.statusLog[nextStatus] = firebase.firestore.FieldValue.serverTimestamp();
      Object.assign(taskData, result.data);
      const commands = [];
      commands.push({
        command: 'set',
        ref: db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`),
        data: taskData,
      });
      await applyUpdates(db, commands);
      return result;
    }
    return result;
  }

};

import { getDocument, getDocuments, applyUpdates } from '../../shared/helpers.js';
import initTaskHelpers from './taskHelpers.js';
import initUpdateTask from './updateTask.js';

export default (config, firebase, db) => {
  const { taskApplicationsEntryStatus } = initTaskHelpers();
  const { getApplications } = initUpdateTask(firebase, db);

  return refreshTaskApplications;

  /**
  * refreshTaskApplications
  * Updates the `applications` data stored in the task
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `type` (required) type of task
  */
  async function refreshTaskApplications(params) {

    let result = {
      success: false,
      data: {},
    };

    // get exercise
    const exercise = await getDocument(db.doc(`exercises/${params.exerciseId}`), true);
    if (!exercise) return result;

    // get task
    const task = await getDocument(db.doc(`exercises/${params.exerciseId}/tasks/${params.type}`));
    if (!task) return result;

    // get status for eligibile applications
    const applicationEntryStatus = taskApplicationsEntryStatus(exercise, params.type);
    console.log('applicationEntryStatus', applicationEntryStatus);

    // get applications
    const applications = await getApplications(exercise, task);

    // update task
    const taskData = {};
    taskData.applications = applications;
    taskData['_stats.totalApplications'] = applications.length;
    const commands = [];
    commands.push({
      command: 'update',
      ref: task.ref,
      data: taskData,
    });

    // get relevant panels
    // check panel applicationIds are all still eligible
    // add any non-eligible ones in `applicationIdsOptional`
    if (task.status === config.TASK_STATUS.PANELS_ACTIVATED) {
      const panels = await getDocuments(db.collection('panels').where('exercise.id', '==', params.exerciseId).where('type', '==', params.type));
      if (panels) {
        panels.forEach(panel => {
          if (panel.applicationIds) {
            const validIds = panel.applicationIds.filter(id => applications.find(application => application.id === id));
            const removedIds = panel.applicationIds.filter(id => !validIds.find(validId => validId === id));
            if (removedIds.length) {
              removedIds.forEach(id => delete panel.applications[id]);
              commands.push({
                command: 'update',
                ref: panel.ref,
                data: {
                  applicationIds: validIds,
                  applications: panel.applications,
                },
              });
            }
          }
        });
      }
    }

    await applyUpdates(db, commands);
    result.success = true;
    return result;
  }

};

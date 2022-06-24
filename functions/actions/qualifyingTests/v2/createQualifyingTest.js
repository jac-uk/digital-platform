const { applyUpdates } = require('../../../shared/helpers');

module.exports = (config, firebase, db) => {
  const qts = require('../../../shared/qts')(config);

  return createQualifyingTest;

  /**
  * createQualifyingTest
  * Create qualifying test on QT platform, plus create corresponding `task`
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  *   `folder` (required) Name of folder to store test
  *   `test`  (object) Test details including:
  *     `type`  (enum)
  *     `title` (string)
  *     `startDate` (datetime)
  *     `endDate` (datetime)
  */
  async function createQualifyingTest(params) {

    const response = await qts.post('qualifying-test', {
      folder: params.folder,
      test: params.test,
    });

    // create task
    const taskData = {
      folderId: response.folderId,
      testId: response.testId,
    };
    taskData['status'] = config.TASK_STATUS.INITIALISED;
    taskData.statusLog = {};
    taskData.statusLog[config.TASK_STATUS.INITIALISED] = firebase.firestore.FieldValue.serverTimestamp();
    const commands = [];
    commands.push({
      command: 'set',
      ref: db.doc(`exercises/${params.exerciseId}/tasks/${params.test.type}`),
      data: taskData,
    });
    await applyUpdates(db, commands);

    // return result
    return response;

  }

};

'use strict';

const _ = require('lodash');
const { app, db } = require('./shared/admin.js');
const { applyUpdates, getDocuments, getDocument } = require('../functions/shared/helpers');

// whether to make changes in `applications` collection in firestore
// true:  make changes in `applications` collection
// false: create a temporary collection `applications_temp` and verify the changes is as expected
const isAction = false;

const main = async () => {
  // get all applications with `qualificationNotComplete` field
  // TODO: optimize query
  const applications = await getDocuments(db.collection('applications').where('exerciseId', '==', 'kqgMVYmxlp5EkNpEiB3K'));

  const commands = [];
  const applicationIds = [];
  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];
    let isUpdate = false;

    if (application.qualifications && application.qualifications.length) {
      application.qualifications.forEach(qualification => {
        // only migrate if `qualificationNotComplete` property is present in qualification
        if ('qualificationNotComplete' in qualification) {
          // create new field `qualificationComplete`
          qualification.qualificationComplete = !qualification.qualificationNotComplete;
          isUpdate = true;
        }
      });
    }

    if (isUpdate) {
      commands.push({
        command: 'set',
        ref: isAction ? application.ref : db.collection('applications_temp').doc(`${application.id}`),
        data: application,
      });
      applicationIds.push(application.id);
    }
  }

  const result = {
    success: null,
    total: applicationIds.length,
    applicationIds,
  };

  if (commands.length) {
    // write to db
    const res = await applyUpdates(db, commands);
    result.success = (res === commands.length);

    if (!isAction) {
      // verify if changes is as expected
      let verifyNum = 0;
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const applicationId = command.data.id;
        const applicationTemp = await getDocument(db.collection('applications_temp').doc(applicationId));
        if (_.isEqual(applicationTemp) === _.isEqual(command.data)) {
          console.log(`${i + 1}. ${applicationId} is matching`);
          verifyNum++;
        }
      }
      result.verifyNum = verifyNum;
    }
  }

  return result;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });

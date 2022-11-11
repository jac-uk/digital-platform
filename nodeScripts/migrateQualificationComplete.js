'use strict';

const { app, db } = require('./shared/admin.js');
const { applyUpdates, getDocuments } = require('../functions/shared/helpers');

// whether to make changes in firestore
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
        command: 'update',
        ref: application.ref,
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
    const res = isAction ? await applyUpdates(db, commands) : commands.length;
    result.success = (res === commands.length);
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

'use strict';

const _ = require('lodash');
const { app, db } = require('./shared/admin.js');
const { applyUpdates, getDocuments, getDocument } = require('../functions/shared/helpers');

// whether to make changes in `applications` collection in firestore
// true:  make changes in `applications` collection
// false: create a temporary collection `applications_temp` and verify the changes is as expected
const isAction = true;

const main = async () => {
  // get all applications
  // TODO: optimize query
  const applications = await getDocuments(db.collection('applications').where('referenceNumber', '==', 'JAC00485-aht0020'));

  const commands = [];
  const applicationIds = [];
  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];

    // only migrate if `personalDetails.fullName` exists
    if (application.personalDetails && application.personalDetails.fullName &&
      (!application._sort || application._sort.fullNameUC !== application.personalDetails.fullName.toUpperCase())
    ) {
      const fullNameUC = application.personalDetails.fullName.toUpperCase();
      _.set(application, '_sort.fullNameUC', fullNameUC);

      if (isAction) {
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            '_sort.fullNameUC': fullNameUC,
          },
        });
      } else {
        const data = _.cloneDeep(application);
        // delete these properties added by getDocuments
        delete data.id;
        delete data.ref;
        commands.push({
          command: 'set',
          ref: db.collection('applications_temp').doc(`${application.id}`),
          data: data,
        });
      }
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
    console.log(commands.length);
    const res = await applyUpdates(db, commands);
    result.success = (res === commands.length);

    if (!isAction) {
      // verify if changes is as expected
      let verifyNum = 0;
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const applicationId = applicationIds[i];
        const applicationTemp = await getDocument(db.collection('applications_temp').doc(applicationId));
        // delete these properties added by getDocument
        delete applicationTemp.id;
        delete applicationTemp.ref;
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

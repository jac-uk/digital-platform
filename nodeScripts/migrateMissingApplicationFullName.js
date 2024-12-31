'use strict';

import _ from 'lodash';
import { app, db } from './shared/admin.js';
import { log } from './shared/helpers.js';
import { applyUpdates, getDocuments, getDocument } from '../functions/shared/helpers.js';

// whether to make changes in `applications` collection in firestore
// true:  make changes in `applications` collection
// false: create a temporary collection `applications_temp` and verify the changes is as expected
const isAction = false;

const main = async () => {
  log('Get applications...');
  // get all applications
  // TODO: optimize query
  const applications = await getDocuments(db.collection('applications'));
  log(`Total applications: ${applications.length}`);

  log('Filter applications...');
  const commands = [];
  const applicationIds = [];

  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];

    // only migrate if `userId` exists and `personalDetails.fullName` does not exist
    if (application.userId && 
      (!application.personalDetails || (application.personalDetails && !application.personalDetails.fullName))
    ) {
      const personalDetails = await getDocument(db.doc(`candidates/${application.userId}/documents/personalDetails`));
      if (personalDetails && personalDetails.fullName) {
        const fullName = personalDetails.fullName;
        _.set(application, 'personalDetails.fullName', fullName);

        if (isAction) {
          commands.push({
            command: 'update',
            ref: application.ref,
            data: {
              'personalDetails.fullName': fullName,
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
            data,
          });
        }
        applicationIds.push(application.id);
      }
    }
  }

  log(`Filtered applications: ${applicationIds.length}`);

  const result = {
    success: null,
    total: applicationIds.length,
    applicationIds,
  };

  if (commands.length) {
    // write to db
    log('Apply updates...');
    const res = await applyUpdates(db, commands);
    result.success = (res === commands.length);
    log('Apply updates done');

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
    log('Done');
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });

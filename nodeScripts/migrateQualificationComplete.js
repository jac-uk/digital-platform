'use strict';

import _ from 'lodash';
import { app, db } from './shared/admin.js';
import { applyUpdates, getDocuments, getDocument } from '../functions/shared/helpers.js';

// whether to make changes in `applications` collection in firestore
// true:  make changes in `applications` collection
// false: create a temporary collection `applications_temp` and verify the changes is as expected
const isAction = false;

const main = async () => {
  // get all applications with `qualificationNotComplete` field
  // TODO: optimize query
  const applications = await getDocuments(db.collection('applications').orderBy('qualifications'));

  const commands = [];
  const applicationIds = [];
  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];
    let isUpdate = false;

    if (application.qualifications && application.qualifications.length) {
      application.qualifications.forEach(qualification => {
        // only migrate if `qualificationNotComplete` property is present in qualification
        if (typeof qualification === 'object' && qualification !== null && qualification.type === 'barrister') {
          if ('qualificationNotComplete' in qualification) {
            // create new field `completedPupillage`
            qualification.completedPupillage = !qualification.qualificationNotComplete;
            isUpdate = true;
          } else {
            if (qualification.date) {
              qualification.completedPupillage = true;
              isUpdate = true;
            }
          }
        }
      });
    }

    if (isUpdate) {
      if (isAction) {
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            qualifications: application.qualifications,
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

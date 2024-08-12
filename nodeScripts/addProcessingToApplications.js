'use strict';

/**
 * Add _processing to applications
 * This new field holds the 'stage' and 'status' fields from the associated applicationRecord
 */

import { firebase, app, db } from './shared/admin.js';
import { getDocument, getDocuments, applyUpdates, objectHasNestedProperty } from '../functions/shared/helpers.js';

async function checkAllApplications() {
  const applications = await getDocuments(db.collection('applications')
    .where('status', 'in', ['applied', 'withdrawn'])
    .select('_processing', 'referenceNumber')
  );
  const commands = [];
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i];

    const hasStageAndStatus = objectHasNestedProperty(application, '_processing.stage') && objectHasNestedProperty(application, '_processing.status');

    if (!hasStageAndStatus) {

      const applicationRecord = await getDocument(db.doc(`applicationRecords/${application.id}`));

      if (applicationRecord) {
        const status = applicationRecord.status ? applicationRecord.status : '';
        const stage = applicationRecord.stage ? applicationRecord.stage : '';
  
        commands.push({
          command: 'update',
          ref: application.ref,
          data: {
            _processing: {
              stage: stage,
              status: status,
            },
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
          },
        });
      }
      else {
        //console.log(`No applicationRecord for: ${application.referenceNumber}`);
      }
    }
  }
      
  console.log('Applications updated:');
  console.log(commands.length);

  // write to db
  const result = await applyUpdates(db, commands);
  return result ? applications.length : false;
}

const main = async () => {
  return checkAllApplications();
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });

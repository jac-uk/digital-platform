'use strict';

/**
 * Node script to update the searchMap (_search) in all applications and their applicationRecords
 * Both applications and applicationRecords will have the same _search map
 * The search map is for:
 * application full name, application email, application NI No, application referenceNumber
 * 
 * Run with: > npm run local:nodeScript temp/syncApplicationsSearchMap.js
 */

import { firebase, app, db } from '../shared/admin.js';
import { getDocument, getDocuments, applyUpdates } from '../../functions/shared/helpers.js';
import { getSearchMap } from '../../functions/shared/search.js';
import { objectHasNestedProperty } from '../../functions/shared/helpers.js';

async function updateAllApplications() {
  const commands = [];
  const applications = await getDocuments(db.collection('applications').select('personalDetails', 'referenceNumber'));
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i];

    const hasFullName = objectHasNestedProperty(application, 'personalDetails.fullName');
    const hasEmail = objectHasNestedProperty(application, 'personalDetails.email');
    const hasNINo = objectHasNestedProperty(application, 'personalDetails.nationalInsuranceNumber');
    const hasReferenceNumber = objectHasNestedProperty(application, 'referenceNumber');

    const searchables = [];
    if (hasFullName) {
      searchables.push(application.personalDetails.fullName);
    }
    if (hasEmail) {
      searchables.push(application.personalDetails.email);
    }
    if (hasNINo) {
      searchables.push(application.personalDetails.nationalInsuranceNumber);
    }
    if (hasReferenceNumber) {
      searchables.push(application.referenceNumber);
    }
    
    if (searchables.length) {
      // Update application
      commands.push({
        command: 'update',
        ref: application.ref,
        data: {
          _search: getSearchMap(searchables),
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        },
      });

      // Only update the applicationRecord if it exists already (has same id as the application!)
      const applicationRecord = await getDocument(db.doc(`applicationRecords/${application.id}`));

      if (applicationRecord) {
        commands.push({
          command: 'update',
          ref: applicationRecord.ref,
          data: {
            _search: getSearchMap(searchables),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
          },
        });
      }
    }
  }

  // write to db
  const result = await applyUpdates(db, commands);
  return result ? applications.length : false;
}

const main = async () => {
  return updateAllApplications();
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

'use strict';

import { app, db } from './shared/admin.js';
import { applyUpdates } from '../functions/shared/helpers.js';

const main = async () => {
  const applicationId = 'SGlHaffdfKLmzXlLT9eq';
  const quantityApplications = 751;

  // get seed application
  const snap = await db.doc(`applications/${applicationId}`).get();
  const applicationData = snap.data();

  // loop and create amended clone applications
  const commands = [];
  for (let i = 0; i < quantityApplications; ++i) {
    const application = JSON.parse(JSON.stringify(applicationData));
    application.referenceNumber = `testData-${i}`;
    application.personalDetails.fullName = `Test Candidate ${i}`;
    commands.push({
      command: 'set',
      ref: db.collection('applications').doc(`testData-${i}`),
      data: application,
    });
  }

  // add to db
  const result = await applyUpdates(db, commands);
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

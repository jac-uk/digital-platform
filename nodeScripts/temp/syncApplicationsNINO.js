'use strict';

/**
 * Node script to update the NINO from candidates to applications
 * 
 * Run with: > npm run local:nodeScript temp/syncApplicationsNINO.js
 */

import { app, db } from '../shared/admin.js';
import { getDocument, getDocuments, applyUpdates } from '../../functions/shared/helpers.js';

const exerciseId = '';
const isAction = false;

const main = async () => {
  if (!exerciseId) throw new Error('Please provide an exerciseId');

  // Get applications
  console.log('-- Fetching applications...');
  const applications = await getDocuments(
    db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('personalDetails.nationalInsuranceNumber', '==', null)
      .select('personalDetails.nationalInsuranceNumber', 'userId')
  );

  if (!applications || !applications.length) return false;
  console.log('-- Fetched applications: ' + applications.length);

  const commands = [];

  // Transfer NINO from candidate to application
  console.log('-- Generating commands to copy NINO from candidate to application...');
  for (let i = 0; i < applications.length; i++) {
    const application = applications[i];
    if (!application.userId) continue;

    const candidate = await getDocument(db.doc(`candidates/${application.userId}/documents/personalDetails`));
    if (!candidate || !candidate.nationalInsuranceNumber) continue;

    commands.push({
      command: 'update',
      ref: application.ref,
      data: {
        'personalDetails.nationalInsuranceNumber': candidate.nationalInsuranceNumber,
      },
    });  
  }
  console.log('-- Commands generated: ' + commands.length);

  if (!commands.length) return false;
  if (isAction) {
    console.log('-- Executing commands');
    // write to db
    const result = await applyUpdates(db, commands);
    console.log('-- Commands executed: ' + result);
    return result ? commands.length : false;
  }
  console.log('-- Commands not executed');
  return true;
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

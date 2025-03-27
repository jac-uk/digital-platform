'use strict';

import { app, db } from './shared/admin.js';
import { getDocuments } from '../functions/shared/helpers.js';


const main = async () => {

  const exerciseId = 'kVlymRGRhZndRaQuqDTf';

  // get invitations
  const invitations = await getDocuments(db.collection('invitations').where('vacancy.id', '==', exerciseId).select('candidate.email'));
  console.log('invitations', invitations.length);

  // get applications (which have applied)
  const applications = await getDocuments(
    db.collection('applications')
    .where('exerciseId', '==', exerciseId)
    .where('referenceNumber', '>', '')
    .select('personalDetails.email')
  );
  console.log('applications', applications.length);

  // get invitations without applications
  const emailsApplied = {};
  applications.forEach(application => {
    if (application.personalDetails && application.personalDetails.email) {
      emailsApplied[application.personalDetails.email] = true;
    }
  });
  const incompleteInvitations = invitations.filter(invitation => !emailsApplied[invitation.candidate.email]);

  console.log('incomplete', incompleteInvitations.length);

  const invitationEmails = incompleteInvitations.map(item => item.candidate.email);
  console.log(invitationEmails.join('\n'));

  // // get data
  // let ref = db.collection('assessments')
  //   .where('exercise.id', '==', 'LYybYFxgdeCzyC1vWZdY')
  //   .where('status', '==', 'draft')
  //   .where('assessor.email', '==', '');
  //   //.select('exercise.referenceNumber', 'application.referenceNumber', 'assessor.email');
  // const documents = await getDocuments(ref);

  // console.log(documents);
  // const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  // const csvWriter = createCsvWriter({
  //   path: 'file.csv',
  //   header: [
  //     { id: 'exerciseRef', title: 'Exercise Ref' },
  //     { id: 'applicationRef', title: 'Application Ref' },
  //     { id: 'assessorEmail', title: 'Assessor email' },
  //   ],
  // });

  // let data = documents.filter(doc => {
  //   if (doc.assessor.email.indexOf(' ') >= 0) {
  //     return true;
  //   }
  // });

  // await csvWriter.writeRecords(data.map(item => {
  //   return {
  //     exerciseRef: item.exercise.referenceNumber,
  //     applicationRef: item.application.referenceNumber,
  //     assessorEmail: `|${item.assessor.email}|`,
  //   };
  // }));

  return true;
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

'use strict';

const { app, db } = require('./shared/admin.js');
const { getDocuments, applyUpdates } = require('../functions/shared/helpers');

const main = async () => {
  
  // for each candidate
    // get personal details
    // get applications draft
    // get applications applied
    // update candidate

  // get candidate IDs
  const candidateData = {};
  const personalDetailsRefs = [];
  const candidates = await getDocuments(db.collection('candidates').orderBy('created'));
  for (let i = 0, len = candidates.length; i < len; ++i) {
    candidateData[candidates[i].id] = {};
    personalDetailsRefs.push(db.doc(`candidates/${candidates[i].id}/documents/personalDetails`));
  }

  // get personal details
  const personalDetailsDocs = await db.getAll(...personalDetailsRefs, { fieldMask: ['fullName'] });
  personalDetailsDocs.forEach((doc) => {
    let candidateId = doc.ref.path.replace('candidates/', '').replace('/documents/personalDetails', '');
    candidateData[candidateId].fullName = doc.exists ? doc.data().fullName : '';
  });

  // get applied applications count
  for (let i = 0, len = candidates.length; i < len; ++i) {
    const snap = await db.collection('applications').where('userId', '==', candidates[i].id).where('status', '==', 'applied').get();
    candidateData[candidates[i].id].applied = snap.docs.length;
  }

  console.log(candidateData);
  // construct update commands
  const commands = [];
  for (let i = 0, len = candidates.length; i < len; ++i) {
    commands.push({
      command: 'update',
      ref: db.collection('candidates').doc(candidates[i].id),
      data: {
        fullName: candidateData[candidates[i].id].fullName,
        'applications.applied': candidateData[candidates[i].id].applied,
      },
    });
  }

  // write to db
  const result = await applyUpdates(db, commands);
  return result ? candidates.length : false;

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

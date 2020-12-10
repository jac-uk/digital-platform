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
  const personalDetailsDocs = await db.getAll(...personalDetailsRefs, { fieldMask: ['fullName', 'email', 'nationalInsuranceNumber'] });
  personalDetailsDocs.forEach((doc) => {
    let candidateId = doc.ref.path.replace('candidates/', '').replace('/documents/personalDetails', '');
    if (doc.exists) {
      const personalDetails = doc.data();
      candidateData[candidateId].fullName = personalDetails.fullName;
      candidateData[candidateId].email = personalDetails.email;
      candidateData[candidateId].nationalInsuranceNumber = personalDetails.nationalInsuranceNumber;
    } else {
      candidateData[candidateId].fullName = '';
      candidateData[candidateId].email = '';
      candidateData[candidateId].nationalInsuranceNumber = '';
    }
  });

  // get applied applications count
  for (let i = 0, len = candidates.length; i < len; ++i) {
    const snap = await db.collection('applications').where('userId', '==', candidates[i].id).where('status', '==', 'applied').get();
    candidateData[candidates[i].id].applied = snap.docs.length;
  }

  // construct update commands
  const commands = [];
  for (let i = 0, len = candidates.length; i < len; ++i) {
    let searchString = `${candidateData[candidates[i].id].fullName} ${candidateData[candidates[i].id].email} ${candidateData[candidates[i].id].nationalInsuranceNumber}`;
    commands.push({
      command: 'update',
      ref: db.collection('candidates').doc(candidates[i].id),
      data: {
        fullName: candidateData[candidates[i].id].fullName,
        email: candidateData[candidates[i].id].email.toLowerCase(),
        keywords: searchString.toLowerCase().split(' '),
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

'use strict';

import { app, db } from './shared/admin.js';
import { applyUpdates, getDocuments, getDocument } from '../functions/shared/helpers.js';
import { applicationOpenDatePost01042023 } from './shared/helpers.js';

const main = async () => {

  const exerciseId = 'wdpALbyICL7ZxxN5AQt8';

  // get exercise
  const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
  if (!(exercise.applicationRecords && exercise.applicationRecords.initialised)) {
    return false;
  }

  // get applications
  let applicationsRef = db.collection('applications')
    .where('exerciseId', '==', exerciseId)
    .where('status', '==', 'applied');
  const applications = await getDocuments(applicationsRef);

  // construct db commands
  const commands = [];
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i];
    commands.push({
      command: 'set',
      ref: db.collection('applicationRecords').doc(`${application.id}`),
      data: {
        diversity: newDiversityFlags(application, exercise),
      },
    });
  }

  // add to db
  const result = await applyUpdates(db, commands);
  return result;
};

function newDiversityFlags(application, exercise) {
  const applicationData = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
  const data = {
    gender: applicationData.gender,
    ethnicity: null,
    disability: applicationData.disability,
    professionalBackground: {
      barrister: null,
      cilex: null,
      solicitor: null,
      other: null,
      preferNotToSay: null,
    },
    socialMobility: {
      attendedUKStateSchool: null,
    },
  };
  // Add checks for different fields after 01-04-2023
  if (applicationOpenDatePost01042023(exercise)) {
    data.socialMobility.parentsAttendedUniversity = null;
  }
  else {
    data.socialMobility.firstGenerationUniversity = null;
  }
  if (applicationData.ethnicGroup) {
    switch (applicationData.ethnicGroup) {
      case 'uk-ethnic':
      case 'irish':
      case 'gypsy-irish-traveller':
      case 'other-white':
        data.ethnicity = 'white';
        break;
      case 'prefer-not-to-say':
        data.ethnicity = applicationData.ethnicGroup;
        break;
      case 'other-ethnic-group':
        data.ethnicity = applicationData.ethnicGroup;
        break;
      default: // @todo check catch all is appropriate for bame
        data.ethnicity = 'bame';
    }
  }
  if (applicationData.professionalBackground && applicationData.professionalBackground.length) {
    if (applicationData.professionalBackground.indexOf('barrister') >= 0) {
      data.professionalBackground.barrister = true;
    }
    if (applicationData.professionalBackground.indexOf('cilex') >= 0) {
      data.professionalBackground.cilex = true;
    }
    if (applicationData.professionalBackground.indexOf('solicitor') >= 0) {
      data.professionalBackground.solicitor = true;
    }
    if (applicationData.professionalBackground.indexOf('other-professional-background') >= 0) {
      data.professionalBackground.other = true;
    }
    if (applicationData.professionalBackground.indexOf('prefer-not-to-say') >= 0) {
      data.professionalBackground.preferNotToSay = true;
    }
  }
  // Add checks for different fields after 01-04-2023
  if (applicationOpenDatePost01042023(exercise)) {
    if (
      application.stateOrFeeSchool16 === 'uk-state-selective'
      || application.stateOrFeeSchool === 'uk-state-non-selective'
    ) {
      data.socialMobility.attendedUKStateSchool = true;
    }
    if (application.parentsAttendedUniversity === true) {
      data.socialMobility.parentsAttendedUniversity = true;
    }
  }
  else {
    if (
      application.stateOrFeeSchool === 'uk-state-selective'
      || application.stateOrFeeSchool === 'uk-state-non-selective'
    ) {
      data.socialMobility.attendedUKStateSchool = true;
    }
    if (application.firstGenerationStudent === true) {
      data.socialMobility.firstGenerationUniversity = true;
    }
  }
  return data;
}

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

const { getDocument, getDocuments } = require('../../shared/helpers');
const { applicationOpenDatePost01042023 } = require('../../shared/converters/helpers');

/**
 * For the diversity reports:
 *  - candidates listing their ethnicity as Other should be included in the BAME category
 *  - display a declaration rate (see example below)
 *  - candidates who have 'Not Answered' or have selected 'Other' or 'Prefer Not To Say' should NOT be included in the percentage 
 *    calculations,
 * eg out of 10 cats:
 *   • 6 said they prefer Whiskers
 *   • 2 said they prefer Applause
 *   • 2 preferred not to say
 * The percent would be:
 *   • 75% said they prefer Whiskers (6 out of 8)
 *   • 25% said they prefer Applause (2 out of 8)
 *   • Declaration rate was 80% (8 out of 10)
 *
 * @param {*} firebase 
 * @param {*} db 
 * @returns 
 */
module.exports = (firebase, db) => {
  return {
    generateDiversityReport,
    genderStats,
    ethnicityStats,
    disabilityStats,
    professionalBackgroundStats,
    socialMobilityStats,
    empStats,
  };

  async function generateDiversityReport(exerciseId) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    if (!exercise) { return false; }

    // get submitted applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', 'in', ['applied', 'withdrawn'])
    );

    // get application records
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
    );

    const report = {
      totalApplications: applications.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      applied: diversityReport(applications, applicationRecords, exercise),
    };


    if (applicationRecords.length) {
      const handoverApplicationRecords = applicationRecords.filter(doc => doc.stage === 'handover');
      const handoverIds = handoverApplicationRecords.map(doc => doc.id);
      const handoverApplications = applications.filter(doc => handoverIds.indexOf(doc.id) >= 0);

      const recommendedApplicationRecords = applicationRecords.filter(doc => doc.stage === 'recommended');
      const recommendedIds = recommendedApplicationRecords.map(doc => doc.id);
      const recommendedApplications = handoverApplications.concat(applications.filter(doc => recommendedIds.indexOf(doc.id) >= 0));

      const selectedApplicationRecords = applicationRecords.filter(doc => doc.stage === 'selected');
      const selectedIds = selectedApplicationRecords.map(doc => doc.id);
      const selectedApplications = recommendedApplications.concat(applications.filter(doc => selectedIds.indexOf(doc.id) >= 0));

      const shortlistedApplicationRecords = applicationRecords.filter(doc => doc.stage === 'shortlisted');
      const shortlistedIds = shortlistedApplicationRecords.map(doc => doc.id);
      const shortlistedApplications = selectedApplications.concat(applications.filter(doc => shortlistedIds.indexOf(doc.id) >= 0));

      report.handover = diversityReport(handoverApplications, handoverApplicationRecords, exercise);
      report.recommended = diversityReport(recommendedApplications, recommendedApplicationRecords, exercise);
      report.selected = diversityReport(selectedApplications, selectedApplicationRecords, exercise);
      report.shortlisted = diversityReport(shortlistedApplications, shortlistedApplicationRecords, exercise);
    }
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('diversity').set(report);
    return report;
  }
};

const diversityReport = (applications, applicationRecords, exercise) => {
  let report = {
    totalApplications: applications.length,
    gender: genderStats(applications),
    ethnicity: ethnicityStats(applications),
    disability: disabilityStats(applications),
    professionalBackground: professionalBackgroundStats(applications),
    socialMobility: socialMobilityStats(applications, exercise),
  };
  if (applicationRecords) {
    report.emp = empStats(applicationRecords);
  }
  return report;
};

const calculatePercents = (report) => {
  if (report.total && report.declaration.total) {
    const keys = Object.keys(report);
    const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer', 'other'];
    for (let i = 0, len = keys.length; i < len; ++i) {
      if (!ignoreKeys.includes(keys[i])) {
        report[keys[i]].percent = 100 * report[keys[i]].total / report.total;
      }
    }
    report.declaration.percent = (report.total / report.declaration.total) * 100;
  }
};

const empStats = (applicationRecords) => {
  const stats = {
    //total: 0,
    declaration: {
      total: 0,
      //percent: 0,
    },
    applied: {
      total: 0,
      percent: 0,
    },
    gender: {
      total: 0,
      percent: 0,
    },
    ethnicity: {
      total: 0,
      percent: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
    },
  };
  for (let i = 0, len = applicationRecords.length; i < len; ++i) {
    const empFlag = applicationRecords[i].flags ? applicationRecords[i].flags.empApplied : null;
    switch (empFlag) {
      case true:
        stats.applied.total += 1;
        //stats.total += 1;
        break;
      case 'gender':
        stats.gender.total += 1;
        //stats.total += 1;
        break;
      case 'ethnicity':
        stats.ethnicity.total += 1;
        //stats.total += 1;
        break;
      default:
        stats.noAnswer.total += 1;
    }
    //stats.declaration.total += 1;
  }

  // Basing these stats on the declaration total NOT the total (which the other stats are being compared to!)
  // @TODO: Awaiting confirmation that using the decalration total is the right thing to do here
  stats.declaration.total = applicationRecords.length;
  stats.applied.percent = stats.applied.total ? (stats.applied.total / stats.declaration.total) * 100 : 0;
  stats.gender.percent = stats.gender.total ? (stats.gender.total / stats.declaration.total) * 100 : 0;
  stats.ethnicity.percent = stats.ethnicity.total ? (stats.ethnicity.total / stats.declaration.total) * 100 : 0;

  //calculatePercents(stats);
  return stats;
};

const genderStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
    },
    male: {
      total: 0,
      percent: 0,
    },
    female: {
      total: 0,
      percent: 0,
    },
    //genderNeutral: {
    //  total: 0,
    //  percent: 0,
    //},
    preferNotToSay: {
      total: 0,
      percent: 0,
    },
    other: {
      total: 0,
      percent: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    switch (application.gender) {
      case 'male':
        stats.male.total += 1;
        stats.total += 1;
        break;
      case 'female':
        stats.female.total += 1;
        stats.total += 1;
        break;
      case 'prefer-not-to-say':
        stats.preferNotToSay.total += 1;
        break;
      case 'gender-neutral':
        //stats.genderNeutral.total += 1;
        //stats.total += 1;
        stats.other.total += 1;
        break;
      case 'other-gender':
        stats.other.total += 1;
        break;
      default:
        stats.noAnswer.total += 1;
    }
    //stats.declaration.total += 1;
  }
  stats.declaration.total = applications.length;
  calculatePercents(stats);
  return stats;
};

const ethnicityStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
    },
    bame: {
      total: 0,
      percent: 0,
    },
    white: {
      total: 0,
      percent: 0,
    },
    // other: {
    //   total: 0,
    //   percent: 0,
    // },
    preferNotToSay: {
      total: 0,
      percent: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    if (application.ethnicGroup) {
      switch (application.ethnicGroup) {
        case 'uk-ethnic':
        case 'irish':
        case 'gypsy-irish-traveller':
        case 'other-white':
          stats.white.total += 1;
          stats.total += 1;
          break;
        case 'prefer-not-to-say':
          stats.preferNotToSay.total += 1;
          break;
        case 'other-ethnic-group':
          //stats.other.total += 1;
          stats.bame.total += 1;  // Count it as 'bame'
          stats.total += 1;
          break;
        default:
          stats.bame.total += 1;
          stats.total += 1;
      }
    } else {
      stats.noAnswer.total += 1;
    }
    //stats.declaration.total += 1;
  }
  stats.declaration.total = applications.length;
  calculatePercents(stats);
  return stats;
};

const disabilityStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
    },
    yes: {
      total: 0,
      percent: 0,
    },
    no: {
      total: 0,
      percent: 0,
    },
    preferNotToSay: {
      total: 0,
      percent: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    // @todo amend how we store disability answers to be string only
    if (application.disability === true) {
      stats.yes.total += 1;
      stats.total += 1;
    } else if (application.disability === false) {
      stats.no.total += 1;
      stats.total += 1;
    } else if (application.disability === 'prefer-not-to-say') {
      stats.preferNotToSay.total += 1;
    } else {
      stats.noAnswer.total += 1;
    }
    //stats.declaration.total += 1;
  }
  stats.declaration.total = applications.length;
  calculatePercents(stats);
  return stats;
};

const professionalBackgroundStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
    },
    barrister: {
      total: 0,
      percent: 0,
    },
    cilex: {
      total: 0,
      percent: 0,
    },
    solicitor: {
      total: 0,
      percent: 0,
    },
    other: {
      total: 0,
      percent: 0,
    },
    preferNotToSay: {
      total: 0,
      percent: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    let incrementTotal = false;
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    if (application.professionalBackground && application.professionalBackground.length) {
      if (application.professionalBackground.indexOf('barrister') >= 0) {
        stats.barrister.total += 1;
        incrementTotal = true;
      }
      if (application.professionalBackground.indexOf('cilex') >= 0) {
        stats.cilex.total += 1;
        incrementTotal = true;
      }
      if (application.professionalBackground.indexOf('solicitor') >= 0) {
        stats.solicitor.total += 1;
        incrementTotal = true;
      }
      if (application.professionalBackground.indexOf('other-professional-background') >= 0) {
        stats.other.total += 1;
      }
      if (application.professionalBackground.indexOf('prefer-not-to-say') >= 0) {
        stats.preferNotToSay.total += 1;
      }
    } else {
      stats.noAnswer.total += 1;
    }
    if (incrementTotal) {
      stats.total += 1;
    }
  }
  stats.declaration.total = applications.length;  // As can have multiple answers per application
  calculatePercents(stats);
  return stats;
};

const socialMobilityStats = (applications, exercise) => {
  const openDatePost01042023 = applicationOpenDatePost01042023(exercise);
  const stats = {
    //total: 0,
    declaration: {
      total: 0,
      //percent: 0,
    },
    attendedUKStateSchool: {
      total: 0,
      percent: 0,
    },
  };
  // Add checks for different fields after 01-04-2023
  if (openDatePost01042023) {
    stats.parentsAttendedUniversity = {
      total: 0,
      percent: 0,
    };
  }
  else {
    stats.firstGenerationUniversity = {
      total: 0,
      percent: 0,
    };
  }
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    // Add checks for different fields after 01-04-2023
    if (openDatePost01042023) {
      if (
        application.stateOrFeeSchool16 === 'uk-state-selective'
        || application.stateOrFeeSchool16 === 'uk-state-non-selective'
      ) {
        stats.attendedUKStateSchool.total += 1;
        //stats.total += 1;
        //stats.declaration.total += 1; // Put this inside the if-else statements in case of leakage of pre/post 01-04
      }
      if (application.parentsAttendedUniversity === true) {
        stats.parentsAttendedUniversity.total += 1;
        //stats.total += 1;
        //stats.declaration.total += 1;
      }
    }
    else {
      if (
        application.stateOrFeeSchool === 'uk-state-selective'
        || application.stateOrFeeSchool === 'uk-state-non-selective'
      ) {
        stats.attendedUKStateSchool.total += 1;
        //stats.total += 1;
        //stats.declaration.total += 1;
      }
      if (application.firstGenerationStudent === true) {
        stats.firstGenerationUniversity.total += 1;
        //stats.total += 1;
        //stats.declaration.total += 1;
      }
    }
  }

  // Basing these stats on the declaration total NOT the total (which the other stats are being compared to!)
  // @TODO: Awaiting confirmation that using the decalration total is the right thing to do here
  stats.declaration.total = applications.length;

  stats.attendedUKStateSchool.percent = stats.attendedUKStateSchool.total ? (stats.attendedUKStateSchool.total / stats.declaration.total) * 100 : 0;
  if (Object.prototype.hasOwnProperty.call(stats, 'parentsAttendedUniversity')) {
    stats.parentsAttendedUniversity.percent = stats.parentsAttendedUniversity.total ? (stats.parentsAttendedUniversity.total / stats.declaration.total) * 100 : 0;
  }
  if (Object.prototype.hasOwnProperty.call(stats, 'firstGenerationUniversity')) {
    stats.firstGenerationUniversity.percent = stats.firstGenerationUniversity.total ? (stats.firstGenerationUniversity.total / stats.declaration.total) * 100 : 0;
  }
  //calculatePercents(stats);
  return stats;
};

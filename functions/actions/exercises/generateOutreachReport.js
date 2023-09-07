const { getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateOutreachReport,
    attendedOutreachStats,
    workshadowingStats,
    hasTakenPAJEStats,
  };

  async function generateOutreachReport(exerciseId) {

    // get submitted applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', 'in', ['applied', 'withdrawn'])
    );

    const report = {
      totalApplications: applications.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      applied: outreachReport(applications),
    };

    // get application records
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
    );
    if (applicationRecords.length) {
      const handoverIds = applicationRecords.filter(doc => doc.stage === 'handover').map(doc => doc.id);
      const handoverApplications = applications.filter(doc => handoverIds.indexOf(doc.id) >= 0);
      //const handoverApplicationRecords = applicationRecords.filter(doc => doc.stage === 'handover');

      const recommendedIds = applicationRecords.filter(doc => doc.stage === 'recommended').map(doc => doc.id);
      const recommendedApplications = handoverApplications.concat(applications.filter(doc => recommendedIds.indexOf(doc.id) >= 0));
      //const recommendedApplicationRecords = applicationRecords.filter(doc => doc.stage === 'recommended');

      const selectedIds = applicationRecords.filter(doc => doc.stage === 'selected').map(doc => doc.id);
      const selectedApplications = recommendedApplications.concat(applications.filter(doc => selectedIds.indexOf(doc.id) >= 0));
      //const selectedApplicationRecords = applicationRecords.filter(doc => doc.stage === 'selected');

      const shortlistedIds = applicationRecords.filter(doc => doc.stage === 'shortlisted').map(doc => doc.id);
      const shortlistedApplications = selectedApplications.concat(applications.filter(doc => shortlistedIds.indexOf(doc.id) >= 0));
      //const shortlistedApplicationRecords = applicationRecords.filter(doc => doc.stage === 'shortlisted');

      report.handover = outreachReport(handoverApplications);
      report.recommended = outreachReport(recommendedApplications);
      report.selected = outreachReport(selectedApplications);
      report.shortlisted = outreachReport(shortlistedApplications);
    }
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('outreach').set(report);

    console.log('report:');
    console.log(report);

    return report;
  }
};

// const outreachReport = (applications) => {
//   return {
//     outreach: outreachStats(applications),
//   };
// };

const outreachReport = (applications) => {
  let report = {
    totalApplications: applications.length,
    // gender: genderStats(applications),
    // ethnicity: ethnicityStats(applications),
    // disability: disabilityStats(applications),
    // professionalBackground: professionalBackgroundStats(applications),

    attended: attendedOutreachStats(applications),
    workshadowing: workshadowingStats(applications),
    outreach: outreachStats(applications),
    hasTakenPAJE: hasTakenPAJEStats(applications),
  };
  return report;
};

// const calculatePercents = (report) => {
//   if (report.total) {
//     let keys = Object.keys(report);
//     keys = keys.filter( item => !item.startsWith('total'));

//     keys.forEach(item => {
//       const itemTotal = report[item].total;
//       const reportTotal = report.total;
//       const myPercent = 100 * itemTotal / reportTotal;
//       report[item].percent = myPercent;
//     });

//   }
// };

const calculatePercents = (report, ignoreKeys) => {
  if (report.total && report.declaration.total) {
    const keys = Object.keys(report);
    for (let i = 0, len = keys.length; i < len; ++i) {
      if (!ignoreKeys.includes(keys[i])) {
        report[keys[i]].percent = 100 * report[keys[i]].total / report.declaration.total;
      }
    }
    report.declaration.percent = (report.declaration.total / report.total) * 100;
  }

  console.log('RETURN FROM calculatePercents:');
  console.log(report);

  return report;
};

const outreachStats = (applications) => {

  console.log('********* OUTREACH (GENERAL) *********');

  const stats = {
    totalApplications: 0,
    //totalApplicationsAnswered: 0,
    total: 0, // total Answers

    'jac-website': {
      total: 0,
      percent: 0,
    },
    'professional-body-website-or-email': {
      total: 0,
      percent: 0,
    },
    'professional-body-magazine': {
      total: 0,
      percent: 0,
    },
    'judicial-office-extranet': {
      total: 0,
      percent: 0,
    },
    'judging-your-future-newsletter': {
      total: 0,
      percent: 0,
    },
    'twitter': {
      total: 0,
      percent: 0,
    },
    'linked-in': {
      total: 0,
      percent: 0,
    },
    'word-of-mouth': {
      total: 0,
      percent: 0,
    },
    'prefer-not-to-say': {
      total: 0,
      percent: 0,
    },
    other: {
      total: 0,
      percent: 0,
    },
    //total: 0,
    declaration: {
      total: 0,
      percent: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    let incrementTotal = false;
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    if (application.additionalInfo && application.additionalInfo.listedSources) {
      if (application.additionalInfo.listedSources.indexOf('jac-website') >= 0) {
        stats['jac-website'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('professional-body-website-or-email') >= 0) {
        stats['professional-body-website-or-email'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('professional-body-magazine') >= 0) {
        stats['professional-body-magazine'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('judicial-office-extranet') >= 0) {
        stats['judicial-office-extranet'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('judging-your-future-newsletter') >= 0) {
        stats['judging-your-future-newsletter'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('twitter') >= 0) {
        stats.twitter.total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('linked-in') >= 0) {
        stats['linked-in'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('word-of-mouth') >= 0) {
        stats['word-of-mouth'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('other') >= 0) {
        stats['other'].total += 1;
        incrementTotal = true;
      }
      if (application.additionalInfo.listedSources.indexOf('prefer-not-to-say') >= 0) {
        stats.preferNotToSay.total += 1;
      }
    } else {
      stats.noAnswer.total += 1;
    }
    if (incrementTotal) {
      stats.declaration.total += 1;
    }
  }
  stats.total = applications.length;  // As can have multiple answers per application

  console.log('STATS TO calculatePercents:');
  console.log(stats);

  // @TODO: Ignore keys can prob be a single constant!!

  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer'];
  calculatePercents(stats, ignoreKeys);
};

const attendedOutreachStats = (applications) => {

  console.log('********* ATTENDED OUTREACH *********');

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
    if (application.attendedOutreachEvents === true) {
      stats.yes.total += 1;
      stats.declaration.total += 1;
    } else if (application.attendedOutreachEvents === false) {
      stats.no.total += 1;
      stats.declaration.total += 1;
    } else if (application.attendedOutreachEvents === 'prefer-not-to-say') {
      stats.preferNotToSay.total += 1;
    } else {
      stats.noAnswer.total += 1;
    }
    //stats.declaration.total += 1;
  }
  stats.total = applications.length;
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const workshadowingStats = (applications) => {

  console.log('********* PAJE OUTREACH *********');

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
    if (application.participatedInJudicialWorkshadowingScheme === true) {
      stats.yes.total += 1;
      stats.declaration.total += 1;
    } else if (application.participatedInJudicialWorkshadowingScheme === false) {
      stats.no.total += 1;
      stats.declaration.total += 1;
    } else if (application.participatedInJudicialWorkshadowingScheme === 'prefer-not-to-say') {
      stats.preferNotToSay.total += 1;
    } else {
      stats.noAnswer.total += 1;
    }
    //stats.declaration.total += 1;
  }
  stats.total = applications.length;
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const hasTakenPAJEStats = (applications) => {
  console.log('********* HAS TAKEN PAJE OUTREACH *********');

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
    if (application.hasTakenPAJE === true) {
      stats.yes.total += 1;
      stats.declaration.total += 1;
    } else if (application.hasTakenPAJE === false) {
      stats.no.total += 1;
      stats.declaration.total += 1;
    } else if (application.hasTakenPAJE === 'prefer-not-to-say') {
      stats.preferNotToSay.total += 1;
    } else {
      stats.noAnswer.total += 1;
    }
    //stats.declaration.total += 1;
  }
  stats.total = applications.length;
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

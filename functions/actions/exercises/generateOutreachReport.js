const { getDocuments, objectHasNestedProperty } = require('../../shared/helpers');
const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer'];

module.exports = (firebase, db) => {
  return {
    generateOutreachReport,
    attendedOutreachStats,
    workshadowingStats,
    hasTakenPAJEStats,
    outreachStats,
  };

  async function generateOutreachReport(exerciseId) {
    // get submitted applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', 'in', ['applied', 'withdrawn'])
      .select('additionalInfo', 'equalityAndDiversitySurvey', 'attendedOutreachEvents', 'participatedInJudicialWorkshadowingScheme', 'hasTakenPAJE')
    );

    const report = {
      totalApplications: applications.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      applied: outreachReport(applications),
    };
    if (applications.length) {

      const handoverApplications = [];
      const recommendedApplications = [];
      const selectedApplications = [];
      const shortlistedApplications = [];

      for (let i = 0, len = applications.length; i < len; ++i) {
        const application = applications[i];
        const hasStageAndStatus = objectHasNestedProperty(application, '_processing.stage') && objectHasNestedProperty(application, '_processing.status');
        if (hasStageAndStatus) {
          switch(application._process.stage) {
            case 'handover':
              handoverApplications.push(application);
              break;
            case 'recommended':
              recommendedApplications.push(application);
              break;
            case 'selected':
              selectedApplications.push(application);
              break;
            case 'shortlisted':
              shortlistedApplications.push(application);
              break;
            default:
              break;
          }
        }

      }
      report.handover = outreachReport(handoverApplications);
      report.recommended = outreachReport(recommendedApplications);
      report.selected = outreachReport(selectedApplications);
      report.shortlisted = outreachReport(shortlistedApplications);
    }
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('outreach').set(report);
    return report;
  }

};

const outreachReport = (applications) => {
  let report = {
    totalApplications: applications.length,
    attended: attendedOutreachStats(applications),
    workshadowing: workshadowingStats(applications),
    outreach: outreachStats(applications),
    hasTakenPAJE: hasTakenPAJEStats(applications),
  };
  return report;
};

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
  return report;
};

const outreachStats = (applications) => {
  const stats = {
    totalApplications: 0,
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
    declaration: {
      total: 0,
      percent: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    let incrementTotal = false;
    const application = applications[i];
    if (objectHasNestedProperty(application, 'additionalInfo.listedSources') && application.additionalInfo.listedSources.length) {
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
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const attendedOutreachStats = (applications) => {
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
  }
  stats.total = applications.length;
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const workshadowingStats = (applications) => {
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
  }
  stats.total = applications.length;
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const hasTakenPAJEStats = (applications) => {
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
    'online-only': {
      total: 0,
      percent: 0,
    },
    'online-and-judge-led': {
      total: 0,
      percent: 0,
    },
    no: {
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
    if (objectHasNestedProperty(application, 'hasTakenPAJE')) {
      if (application.hasTakenPAJE === null || application.hasTakenPAJE === undefined) {
        stats.noAnswer.total += 1;
      }
      else if (
        application.hasTakenPAJE === true
      ) {
        stats.yes.total += 1;
        stats.declaration.total += 1;
      }
      else if (
        application.hasTakenPAJE === 'online-only'
      ) {
        stats['online-only'].total += 1;
        stats.declaration.total += 1;
      }
      else if (
        application.hasTakenPAJE === 'online-and-judge-led'
      ) {
        stats['online-and-judge-led'].total += 1;
        stats.declaration.total += 1;
      }

      else if (
        application.hasTakenPAJE === false
        || String.prototype.toLowerCase.call(application.hasTakenPAJE) === 'no'
      ) {
        stats.no.total += 1;
        stats.declaration.total += 1;
      } else {
        stats.noAnswer.total += 1;
      }
    }
    else {
      stats.noAnswer.total += 1;
    }
  }
  stats.total = applications.length;
  calculatePercents(stats, ignoreKeys);
  return stats;
};

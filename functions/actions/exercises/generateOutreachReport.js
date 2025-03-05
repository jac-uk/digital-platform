import { getDocument, getDocuments, objectHasNestedProperty } from '../../shared/helpers.js';
import initExerciseHelper from '../../shared/exerciseHelper.js';
import { APPLICATION_STATUS, SHORTLISTING } from '../../shared/constants.js';

const ignoreKeys = ['totalApplications', 'total', 'declaration', 'preferNotToSay', 'noAnswer'];

export default (firebase, db) => {
  const { availableStages } = initExerciseHelper();
  return {
    generateOutreachReport,
    attendedOutreachStats,
    workshadowingStats,
    hasTakenPAJEStats,
    outreachStats,
  };

  async function generateOutreachReport(exerciseId) {
    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    if (!exercise) { return false; }

    // get submitted applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', 'in', ['applied', 'withdrawn'])
      .select('additionalInfo', 'equalityAndDiversitySurvey', 'attendedOutreachEvents', 'participatedInJudicialWorkshadowingScheme', 'hasTakenPAJE')
    );

    // get application records
    const applicationRecords = await getDocuments(db.collection('applicationRecords').where('exercise.id', '==', exerciseId));

    const report = {
      totalApplications: applications.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      applied: outreachReport(applications),
    };

    const stages = availableStages(exercise);
    if (stages.length && applications.length) {
      for (let i = stages.length - 1; i >= 0; --i) {
        const stage = stages[i];
        const applicationsByStage = applications.filter(application =>
          objectHasNestedProperty(application, '_processing.stage') &&
          objectHasNestedProperty(application, '_processing.status') &&
          application._processing.stage === stage
        );
        report[stage] = outreachReport(applicationsByStage);
      }
    }

    // add additional data based on shortlisting methods
    const isProcessingVersion2 = exercise._processingVersion >= 2;
    const statuses = [];

    if (exercise.shortlistingMethods) {
      // qt
      if (exercise.shortlistingMethods.some(method => [
        SHORTLISTING.SITUATIONAL_JUDGEMENT_QUALIFYING_TEST,
        SHORTLISTING.CRITICAL_ANALYSIS_QUALIFYING_TEST,
      ].includes(method))) {
        const status = isProcessingVersion2 ? APPLICATION_STATUS.QUALIFYING_TEST_PASSED : APPLICATION_STATUS.PASSED_FIRST_TEST;
        statuses.push(status);
      }
      // scenario test
      if (exercise.shortlistingMethods.includes(SHORTLISTING.SCENARIO_TEST_QUALIFYING_TEST)) {
        const status = isProcessingVersion2 ? APPLICATION_STATUS.SCENARIO_TEST_PASSED : APPLICATION_STATUS.PASSED_SCENARIO_TEST;
        statuses.push(status);
      }
      // sift
      if (exercise.shortlistingMethods.some(method => [
        SHORTLISTING.NAME_BLIND_PAPER_SIFT,
        SHORTLISTING.PAPER_SIFT,
      ].includes(method))) {
        const status = isProcessingVersion2 ? APPLICATION_STATUS.SIFT_PASSED : APPLICATION_STATUS.PASSED_SIFT;
        statuses.push(status);
      }
    }

    statuses.forEach(status => {
      // get applications by status in statusLog
      const applicationRecordsByStatus = applicationRecords.filter(doc => doc.statusLog && doc.statusLog[status]);
      const applicationsByStatus = applications.filter(doc => applicationRecordsByStatus.map(doc => doc.id).includes(doc.id));
      report[status] = outreachReport(applicationsByStatus);
    });

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

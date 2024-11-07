import { getDocument, getDocuments } from '../../shared/helpers.js';
import { applicationOpenDatePost01042023 } from '../../shared/converters/helpers.js';
import initExerciseHelper from '../../shared/exerciseHelper.js';

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
 * @param {*} config
 * @param {*} firebase
 * @param {*} db 
 * @returns 
 */
export default (config, firebase, db) => {
  const { availableStages } = initExerciseHelper(config);

  return {
    generateDiversityReport,
    genderStats,
    ethnicityStats,
    disabilityStats,
    professionalBackgroundStats,
    attendedUKStateSchoolStats,
    parentsNotAttendedUniversityStats,
    firstGenerationUniversityStats,
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

    // exclude shortlisted
    const EXERCISE_STAGE = config.EXERCISE_STAGE;
    const stages = availableStages(exercise)
      .filter(stage => ![EXERCISE_STAGE.SHORTLISTED, EXERCISE_STAGE.SELECTION, EXERCISE_STAGE.SCC].includes(stage))
      .map((stage) => {
        switch (stage) {
        case EXERCISE_STAGE.SHORTLISTING:
        case EXERCISE_STAGE.REVIEW:
          return EXERCISE_STAGE.APPLIED;
        case EXERCISE_STAGE.SELECTION:
        case EXERCISE_STAGE.RECOMMENDATION:
        default:
          return stage;
        }
      });
    let applicationRecordsByPreviousStage = [];
    if (stages.length && applicationRecords.length) {
      for (let i = stages.length - 1; i >= 0; --i) {
        const stage = stages[i];
        const applicationRecordsByStage = applicationRecords.filter(doc => doc.stage === stage);
        const applicationIdsByStage = applicationRecordsByStage.map(doc => doc.id);
        let applicationsByStage = applications.filter(doc => applicationIdsByStage.indexOf(doc.id) >= 0);
        if (applicationRecordsByPreviousStage.length) {
          applicationsByStage = applicationsByStage.concat(applicationRecordsByPreviousStage);
        }
        report[stage] = diversityReport(applicationsByStage, applicationRecordsByStage, exercise);
        // store for next iteration
        applicationRecordsByPreviousStage = applicationsByStage;
      }
    }

    // add additional data based on shortlisting methods
    const isProcessingVersion2 = exercise._processingVersion >= 2;
    const APPLICATION_STATUS = config.APPLICATION_STATUS;
    const SHORTLISTING = config.SHORTLISTING;
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

    if (isProcessingVersion2) {
      statuses.push(APPLICATION_STATUS.SELECTION_DAY_PASSED);
    } else {
      statuses.push(APPLICATION_STATUS.PASSED_SELECTION);
    }

    statuses.forEach(status => {
      // get applications by status in statusLog
      const applicationRecordsByStatus = applicationRecords.filter(doc => doc.statusLog && doc.statusLog[status]);
      const applicationsByStatus = applications.filter(doc => applicationRecordsByStatus.map(doc => doc.id).includes(doc.id));
      report[status] = diversityReport(applicationsByStatus, applicationRecordsByStatus, exercise);
    });

    // calculate change from previous state
    const states = [stages[0], ...statuses, ...stages.slice(1)];
    for (let i = 1; i < states.length; i++) {
      const curState = states[i];
      const prevState = states[i - 1];
      const curReport = report[curState];
      const prevReport = report[prevState];
      if (!curReport) break;

      Object.keys(curReport).forEach((key) => {
        Object.keys(curReport[key]).forEach((subKey) => {
          if (!['total'].includes(subKey)) {
            curReport[key][subKey].change = curReport[key][subKey].percent - prevReport[key][subKey].percent;
          }
        });
      });
    }

    await db.collection('exercises').doc(exerciseId).collection('reports').doc('diversity').set(report);
    return report;
  }
};

const diversityReport = (applications, applicationRecords, exercise) => {
  const openDatePost01042023 = applicationOpenDatePost01042023(exercise);
  let report = {
    totalApplications: applications.length,
    gender: genderStats(applications),
    ethnicity: ethnicityStats(applications),
    disability: disabilityStats(applications),
    professionalBackground: professionalBackgroundStats(applications),
    attendedUKStateSchool: attendedUKStateSchoolStats(applications, exercise),
  };
  // Social Mobility
  if (openDatePost01042023) {
    report.parentsNotAttendedUniversity = parentsNotAttendedUniversityStats(applications);
  }
  else {
    report.firstGenerationUniversity = firstGenerationUniversityStats(applications);
  }

  if (applicationRecords) {
    report.emp = empStats(applicationRecords);
  }
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

const empStats = (applicationRecords) => {
  const stats = {
    total: 0,
    applied: {
      total: 0,
      percent: 0,
      change: 0,
    },
    gender: {
      total: 0,
      percent: 0,
      change: 0,
    },
    ethnicity: {
      total: 0,
      percent: 0,
      change: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
      change: 0,
    },
  };
  for (let i = 0, len = applicationRecords.length; i < len; ++i) {
    const empFlag = applicationRecords[i].flags ? applicationRecords[i].flags.empApplied : null;
    switch (empFlag) {
      case true:
        stats.applied.total += 1;
        break;
      case 'gender':
        stats.gender.total += 1;
        break;
      case 'ethnicity':
        stats.ethnicity.total += 1;
        break;
      default:
        stats.noAnswer.total += 1;
    }
  }
  stats.total = applicationRecords.length;
  stats.applied.percent = stats.applied.total ? (stats.applied.total / stats.total) * 100 : 0;
  stats.gender.percent = stats.gender.total ? (stats.gender.total / stats.total) * 100 : 0;
  stats.ethnicity.percent = stats.ethnicity.total ? (stats.ethnicity.total / stats.total) * 100 : 0;
  return stats;
};

const genderStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
      change: 0,
    },
    male: {
      total: 0,
      percent: 0,
      change: 0,
    },
    female: {
      total: 0,
      percent: 0,
      change: 0,
    },
    //genderNeutral: {
    //  total: 0,
    //  percent: 0,
    //},
    preferNotToSay: {
      total: 0,
      percent: 0,
      change: 0,
    },
    other: {
      total: 0,
      percent: 0,
      change: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
      change: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    switch (application.gender) {
      case 'male':
        stats.male.total += 1;
        stats.declaration.total += 1;
        break;
      case 'female':
        stats.female.total += 1;
        stats.declaration.total += 1;
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
  stats.total = applications.length;
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer', 'other'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const ethnicityStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
      change: 0,
    },
    bame: {
      total: 0,
      percent: 0,
      change: 0,
    },
    white: {
      total: 0,
      percent: 0,
      change: 0,
    },
    // other: {
    //   total: 0,
    //   percent: 0,
    // },
    preferNotToSay: {
      total: 0,
      percent: 0,
      change: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
      change: 0,
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
        case 'roma':
          stats.white.total += 1;
          stats.declaration.total += 1;
          break;
        case 'prefer-not-to-say':
          stats.preferNotToSay.total += 1;
          break;
        case 'other-ethnic-group':
          //stats.other.total += 1;
          stats.bame.total += 1;  // Count it as 'bame'
          stats.declaration.total += 1;
          break;
        default:
          stats.bame.total += 1;
          stats.declaration.total += 1;
      }
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

const disabilityStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
      change: 0,
    },
    yes: {
      total: 0,
      percent: 0,
      change: 0,
    },
    no: {
      total: 0,
      percent: 0,
      change: 0,
    },
    preferNotToSay: {
      total: 0,
      percent: 0,
      change: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
      change: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    // @todo amend how we store disability answers to be string only
    if (application.disability === true) {
      stats.yes.total += 1;
      stats.declaration.total += 1;
    } else if (application.disability === false) {
      stats.no.total += 1;
      stats.declaration.total += 1;
    } else if (application.disability === 'prefer-not-to-say') {
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

const professionalBackgroundStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
      change: 0,
    },
    barrister: {
      total: 0,
      percent: 0,
      change: 0,
    },
    cilex: {
      total: 0,
      percent: 0,
      change: 0,
    },
    solicitor: {
      total: 0,
      percent: 0,
      change: 0,
    },
    other: {
      total: 0,
      percent: 0,
      change: 0,
    },
    preferNotToSay: {
      total: 0,
      percent: 0,
      change: 0,
    },
    noAnswer: {
      total: 0,
      percent: 0,
      change: 0,
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
        incrementTotal = true;
      }
      if (application.professionalBackground.indexOf('prefer-not-to-say') >= 0) {
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
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const attendedUKStateSchoolStats = (applications, exercise) => {
  const openDatePost01042023 = applicationOpenDatePost01042023(exercise);
  const attendedUKStateSchoolFieldName = openDatePost01042023 ? 'stateOrFeeSchool16' : 'stateOrFeeSchool';
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
      change: 0,
    },
    attendedUKStateSchool: {
      total: 0,
      percent: 0,
      change: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];

    if (Object.prototype.hasOwnProperty.call(application, attendedUKStateSchoolFieldName)) {
      // Add checks for different fields after 01-04-2023
      if (
        application[attendedUKStateSchoolFieldName] === 'uk-state-selective'
        || application[attendedUKStateSchoolFieldName] === 'uk-state-non-selective'
      ) {
        stats.attendedUKStateSchool.total += 1;
        //stats.total += 1;
      }
      if (application[attendedUKStateSchoolFieldName] !== 'prefer-not-to-say') {
        stats.declaration.total += 1;
      }
    }
  }
  stats.total = applications.length;
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer', 'other'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const parentsNotAttendedUniversityStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
      change: 0,
    },
    parentsNotAttendedUniversity: {
      total: 0,
      percent: 0,
      change: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];

    if (Object.prototype.hasOwnProperty.call(application, 'parentsAttendedUniversity')) {
      if (application.parentsAttendedUniversity === false) {
        stats.parentsNotAttendedUniversity.total += 1;
        stats.declaration.total += 1;
      }
      else if (application.parentsAttendedUniversity !== 'prefer-not-to-say') {
        stats.declaration.total += 1;
      }
    }
  }
  stats.total = applications.length;
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer', 'other'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

const firstGenerationUniversityStats = (applications) => {
  const stats = {
    total: 0,
    declaration: {
      total: 0,
      percent: 0,
      change: 0,
    },
    firstGenerationUniversity: {
      total: 0,
      percent: 0,
      change: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];

    if (Object.prototype.hasOwnProperty.call(application, 'firstGenerationStudent')) {
      if (application.firstGenerationStudent === true) {
        stats.firstGenerationUniversity.total += 1;
        stats.declaration.total += 1;
      }
      else if (application.firstGenerationStudent !== 'prefer-not-to-say') {
        stats.declaration.total += 1;
      }
    }
  }
  stats.total = applications.length;
  const ignoreKeys = ['total', 'declaration', 'preferNotToSay', 'noAnswer', 'other'];
  calculatePercents(stats, ignoreKeys);
  return stats;
};

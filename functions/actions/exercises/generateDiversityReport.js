const { getDocument, getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateDiversityReport,
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
      applied: diversityReport(applications, applicationRecords),
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

      report.handover = diversityReport(handoverApplications, handoverApplicationRecords);
      report.recommended = diversityReport(recommendedApplications, recommendedApplicationRecords);
      report.selected = diversityReport(selectedApplications, selectedApplicationRecords);
      report.shortlisted = diversityReport(shortlistedApplications, shortlistedApplicationRecords);
    }
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('diversity').set(report);
    return report;
  }
};

const diversityReport = (applications, applicationRecords) => {
  let report = {
    totalApplications: applications.length,
    gender: genderStats(applications),
    ethnicity: ethnicityStats(applications),
    disability: disabilityStats(applications),
    professionalBackground: professionalBackgroundStats(applications),
    socialMobility: socialMobilityStats(applications),
  };
  if (applicationRecords) {
    report.emp = empStats(applicationRecords);
  }
  return report;
};

const calculatePercents = (report) => {
  if (report.total) {
    const keys = Object.keys(report);
    for (let i = 0, len = keys.length; i < len; ++i) {
      if (keys[i] !== 'total') {
        report[keys[i]].percent = 100 * report[keys[i]].total / report.total;
      }
    }
  }
};

const empStats = (applicationRecords) => {
  const stats = {
    total: 0,
    applied: {
      total: 0,
    },
    gender: {
      total: 0,
    },
    ethnicity: {
      total: 0,
    },
    noAnswer: {
      total: 0,
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
    stats.total += 1;
  }
  calculatePercents(stats);
  return stats;

};

const genderStats = (applications) => {
  const stats = {
    total: 0,
    male: {
      total: 0,
    },
    female: {
      total: 0,
    },
    genderNeutral: {
      total: 0,
    },
    preferNotToSay: {
      total: 0,
    },
    other: {
      total: 0,
    },
    noAnswer: {
      total: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    switch (application.gender) {
      case 'male':
        stats.male.total += 1;
        break;
      case 'female':
        stats.female.total += 1;
        break;
      case 'prefer-not-to-say':
        stats.preferNotToSay.total += 1;
        break;
      case 'gender-neutral':
        stats.genderNeutral.total += 1;
        break;
      case 'other-gender':
        stats.other.total += 1;
        break;
      default:
        stats.noAnswer.total += 1;
    }
    stats.total += 1;
  }
  calculatePercents(stats);
  return stats;
};

const ethnicityStats = (applications) => {
  const stats = {
    total: 0,
    bame: {
      total: 0,
    },
    white: {
      total: 0,
    },
    other: {
      total: 0,
    },
    preferNotToSay: {
      total: 0,
    },
    noAnswer: {
      total: 0,
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
          break;
        case 'prefer-not-to-say':
          stats.preferNotToSay.total += 1;
          break;
        case 'other-ethnic-group':
          stats.other.total += 1;
          break;
        default: // @todo check catch all is appropriate for bame
          stats.bame.total += 1;
      }
    } else {
      stats.noAnswer.total += 1;
    }
    stats.total += 1;
  }
  calculatePercents(stats);
  return stats;
};

const disabilityStats = (applications) => {
  const stats = {
    total: 0,
    yes: {
      total: 0,
    },
    no: {
      total: 0,
    },
    preferNotToSay: {
      total: 0,
    },
    noAnswer: {
      total: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    // @todo amend how we store disability answers to be string only
    if (application.disability === true) {
      stats.yes.total += 1;
    } else if (application.disability === false) {
      stats.no.total += 1;
    } else if (application.disability === 'prefer-not-to-say') {
      stats.preferNotToSay.total += 1;
    } else {
      stats.noAnswer.total += 1;
    }
    stats.total += 1;
  }
  calculatePercents(stats);
  return stats;
};

const professionalBackgroundStats = (applications) => {
  const stats = {
    total: 0,
    barrister: {
      total: 0,
    },
    cilex: {
      total: 0,
    },
    solicitor: {
      total: 0,
    },
    other: {
      total: 0,
    },
    preferNotToSay: {
      total: 0,
    },
    noAnswer: {
      total: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    if (application.professionalBackground && application.professionalBackground.length) {
      if (application.professionalBackground.indexOf('barrister') >= 0) {
        stats.barrister.total += 1;
      }
      if (application.professionalBackground.indexOf('cilex') >= 0) {
        stats.cilex.total += 1;
      }
      if (application.professionalBackground.indexOf('solicitor') >= 0) {
        stats.solicitor.total += 1;
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
    stats.total += 1;
  }
  calculatePercents(stats);
  return stats;
};

const socialMobilityStats = (applications) => {
  const stats = {
    total: 0,
    attendedUKStateSchool: {
      total: 0,
    },
    firstGenerationUniversity: {
      total: 0,
    },
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i].equalityAndDiversitySurvey ? applications[i].equalityAndDiversitySurvey : applications[i];
    if (
      application.stateOrFeeSchool === 'uk-state-selective'
      || application.stateOrFeeSchool === 'uk-state-non-selective'
    ) {
      stats.attendedUKStateSchool.total += 1;
    }
    if (application.firstGenerationStudent === true) {
      stats.firstGenerationUniversity.total += 1;
    }
    stats.total += 1;
  }
  calculatePercents(stats);
  return stats;
};

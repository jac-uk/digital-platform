const { getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateOutreachReport,
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
      const recommendedIds = applicationRecords.filter(doc => doc.stage === 'recommended').map(doc => doc.id);
      const selectedIds = applicationRecords.filter(doc => doc.stage === 'selected').map(doc => doc.id);
      const shortlistedIds = applicationRecords.filter(doc => doc.stage === 'shortlisted').map(doc => doc.id);
      const handoverApplications = applications.filter(doc => handoverIds.indexOf(doc.id) >= 0);
      const recommendedApplications = handoverApplications.concat(applications.filter(doc => recommendedIds.indexOf(doc.id) >= 0));
      const selectedApplications = recommendedApplications.concat(applications.filter(doc => selectedIds.indexOf(doc.id) >= 0));
      const shortlistedApplications = selectedApplications.concat(applications.filter(doc => shortlistedIds.indexOf(doc.id) >= 0));

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
  return {
    outreach: outreachStats(applications),
  };
};

const calculatePercents = (report) => {
  if (report.total) {
    let keys = Object.keys(report);
    keys = keys.filter( item => !item.startsWith('total'));

    keys.forEach(item => {
      const itemTotal = report[item].total;
      const reportTotal = report.total;
      const myPercent = 100 * itemTotal / reportTotal;
      report[item].percent = myPercent;
    });

  }
};

const outreachStats = (applications) => {
  const stats = {
    totalApplications: 0,
    totalApplicationsAnswered: 0,
    total: 0, // total Answers
  };
  for (let i = 0, len = applications.length; i < len; ++i) {
    const application = applications[i];
    if (application) {
      if (application.additionalInfo && application.additionalInfo.listedSources) {
        stats.totalApplicationsAnswered += 1;
        application.additionalInfo.listedSources.map(item => {
          if (stats[item] === undefined) {
            stats[item] = {
              total: 0,
            };
          }
          stats[item].total += 1;
          stats.total += 1;
          return item;
        });
      }
    }
    stats.totalApplications += 1;
  }
  calculatePercents(stats);
  return stats;
};



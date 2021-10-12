const { getDocuments } = require('../../shared/helpers');

module.exports = (config, db) => {
  return {
    checkApplications,
  };

  async function checkApplications(exerciseId) {
    const applicationsDraft = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', '==', 'draft')
    );
    const applicationsApplied = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', '==', 'applied')
    );
    const applicationsWithdrawn = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', '==', 'withdrawn')
    );
    return ({'draft': applicationsDraft.length, 'applied': applicationsApplied.length, 'withdrawn': applicationsWithdrawn.length});
  }
};

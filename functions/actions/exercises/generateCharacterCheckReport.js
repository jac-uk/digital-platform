const helpers = require('../../shared/converters/helpers');
const { getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    getCharacterReport,
  };

  async function getCharacterReport(eId) {
    // get submitted applications that have character check declarations
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('characterChecks.declaration', '==', true));

    const headers = getHeaders();
  }

  function getHeaders() {

  }
};

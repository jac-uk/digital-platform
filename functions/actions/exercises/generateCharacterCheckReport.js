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
    return [
      {title: 'Ref', name: 'ref'},
      {title: 'Name', name: 'name'},
      {title: 'Email', name: 'email'},
      {title: 'Citizenship', name: 'citizenship'},
      {title: 'Date of Birth', name: 'dob'},
      {title: 'Qualifications', name: 'qualifications'},
      {title: 'Character', name: 'character'},
    ];
  }

  function getRows(applications) {
    return applications.map(application => {

    });
  }
};

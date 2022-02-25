const { getDocument } = require('./helpers');

module.exports = (firebase, db) => {
  return checkServiceStatus;

  async function checkServiceStatus() {
    const services = await getDocument(db.doc('settings/services'));
    return services.functions.enabled;
  }
};

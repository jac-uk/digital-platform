const { applyUpdates } = require('../../../shared/helpers');

module.exports = (config, db) => {
  const { updateCandidate } = require('../search')(db);

  return onUpdate;

  /**
   * Candidate Personal Details event handler for Update
   */
  async function onUpdate(candidateId, dataBefore, dataAfter) {

    // update candidate document
    const result = await updateCandidate(candidateId);

    return result;
  }

};

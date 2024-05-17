module.exports = (config, db) => {
  const { updateCandidate } = require('../search')(db);

  return onCreate;

  /**
   * Candidate Personal Details event handler for Create
   */
  async function onCreate(candidateId, dataBefore, dataAfter) {

    // update candidate document
    const result = await updateCandidate(candidateId);

    return result;
  }

};

import initSearch from '../search.js';

export default (config, firebase, db) => {
  const { updateCandidate } = initSearch(firebase, db);

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

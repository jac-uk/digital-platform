import initSearch from '../search.js';

export default (config, firebase, db) => {
  const { updateCandidate } = initSearch(firebase, db);

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

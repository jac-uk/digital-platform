//const { getDocument, applyUpdates, isDateInPast, formatDate } = require('../../shared/helpers');
const { getSearchMap } = require('../../shared/search');

module.exports = (db) => {

  const { updateExercise } = require('./exercises')(db);

  return onCreate;

  /**
   * Exercise event handler for Create
   * - Add _search terms to the exercise
   */
  async function onCreate(exerciseId, name, referenceNumber) {
    const data = {};

    // Add search map
    data._search = getSearchMap([name, referenceNumber]);

    updateExercise(exerciseId, data);

    return true;
  }
};

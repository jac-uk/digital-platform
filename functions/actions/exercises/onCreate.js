import { getSearchMap } from '../../shared/search.js';
import initExercises from './exercises.js';

export default (db) => {

  const { updateExercise } = initExercises(db);

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

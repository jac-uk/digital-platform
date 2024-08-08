import initFactories from '../shared/factories.js';

export default (config, db) => {
  const { newVacancy } = initFactories(config);

  return {
    deleteVacancy,
    updateVacancy,
  };

  /**
   * Delete vacancy document with the provided ID
   */
  async function deleteVacancy(vacancyId) {
    try {
      await db.collection('vacancies').doc(vacancyId).delete();
      return true;
    } catch (e) {
      console.error(`Error writing vacancy ${vacancyId}`, e);
      return false;
    }
  }

  /**
   * Update vacancy document with the provided ID and data
   */
  async function updateVacancy(vacancyId, data) {
    const vacancy = newVacancy(data);
    try {
      await db.collection('vacancies').doc(vacancyId).set(vacancy);
      return true;
    } catch (e) {
      console.error(`Error writing vacancy ${vacancyId}`, e);
      return false;
    }
  }

};

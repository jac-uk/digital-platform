import initGetApplicationData from './getApplicationData.js';

export default (config, firebase, db, auth) => {

  const getApplicationData = initGetApplicationData(config, firebase, db, auth);

  return getMultipleApplicationData;  
  async function getMultipleApplicationData(exerciseIds, columns) {
    const allData = [];

    for (const exerciseId of exerciseIds) {
      const whereClauses = [];
      const exerciseParams = { whereClauses, columns, exerciseId };
      const exerciseData = await getApplicationData(exerciseParams);

      if (Array.isArray(exerciseData)) {
        allData.push(...exerciseData);
      } else {
        console.warn(`Non-iterable data returned for exerciseId: ${exerciseId}`, exerciseData);
      }
    }

    return allData;
  }
};
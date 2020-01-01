const setData = require('../sharedServices').setData;
const slog = require('../sharedServices').slog;
const db = require('../sharedServices').db;
const getExercisesWithDate = require('../sharedServices').getExercisesWithDate;


const processApplications = async (applicationIds) => {
  // for each application, set application.status = "request-assessors"
  applicationIds.forEach(doc => {
    setData('applications', doc.id, {status: 'request-assessors'});
  });
  return null;
};


const getApplications = async (exerciseId) => {
  let ref = db.collection('applications');

  // find applications given the exerciseId
  let snapshot;
  try {
    snapshot = await ref.where('exerciseId', '=', exerciseId).get(); 
  } 
  catch(err) {
    slog(`
      ERROR: Bad query: ref.where('exerciseId', '=', exerciseId).get() :
    `, err);
    return null;
  }

  if (snapshot.empty) {
    slog(`
      No matching documents in Applications
      where exerciseId = ${exerciseId}
    `);
    return null;
  }

  processApplications(snapshot);  
  return null;
};


const notifyAssessors = async (exerciseIds) => {
  // Get applications by exerciseId
  exerciseIds.forEach(doc => {
    getApplications(doc.id);
  });

  return null;
};


const remindAssessorsToAssess = async () => {
  const exercisesWithContactIndependentAssessorsDateTodayPromise = getExercisesWithDate('contactIndependentAssessors'); 
  const exercisesWithContactIndependentAssessorsDateToday = await exercisesWithContactIndependentAssessorsDateTodayPromise;
  if (exercisesWithContactIndependentAssessorsDateToday != null) {
    notifyAssessors(exercisesWithContactIndependentAssessorsDateToday);
  }
  return null;
};


module.exports = {
  remindAssessorsToAssess,
};

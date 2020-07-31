const setData = require('../sharedServices').setData;
const slog = require('../sharedServices').slog;
const db = require('../sharedServices').db;
const getExercisesWithDate = require('../sharedServices').getExercisesWithDate;


const getExercisesWithReminderDate = async (dateFieldName) => {
  // set today's date to 2 weeks before
  const today = new Date();
  today.setDate(today.getDate() - 14);

  // set yesterday's date to 2 weeks before - 1 day
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 15);

  slog(`
    SCHEDULED JOB: Send reminder emails (2 weeks after original email)
    Looking for exercises where ${dateFieldName} = ${today}
  `);

  let exercisesRef = db.collection('exercises');

  let snapshot;
  try {
    snapshot = await exercisesRef.where(dateFieldName, '>', yesterday).where(dateFieldName, '<', today).get(); 
  } catch(err) {
    slog(`
      ERROR: Bad query: exercisesRef.where(${dateFieldName}, '>', yesterday).where(${dateFieldName}, '<', today).get() :
    `, err);
    return null;
  }

  if (snapshot.empty) {
    slog(`
      No matching documents in Exercises
      (2 weeks after original email) 
      where ${dateFieldName} > ${yesterday}
      and ${dateFieldName} < ${today}`);
    return null;
  }

  return snapshot;
};


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
  // send initial email asking assessors to do assessments
  const exercisesWithContactIndependentAssessorsDateTodayPromise = getExercisesWithDate('contactIndependentAssessors'); 
  const exercisesWithContactIndependentAssessorsDateToday = await exercisesWithContactIndependentAssessorsDateTodayPromise;
  if (exercisesWithContactIndependentAssessorsDateToday !== null) {
    notifyAssessors(exercisesWithContactIndependentAssessorsDateToday);
  }

  // remind assessors 2 weeks after if they haven't done their assessments
  const reminderEmailsTodayPromise = getExercisesWithReminderDate('contactIndependentAssessors'); 
  const reminderEmailsToday = await reminderEmailsTodayPromise;
  if (reminderEmailsToday !== null) {
    notifyAssessors(reminderEmailsToday);
  }  
  return null;
};


module.exports = {
  remindAssessorsToAssess,
};

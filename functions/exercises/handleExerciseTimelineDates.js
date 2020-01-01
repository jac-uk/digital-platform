/*eslint-disable no-unused-vars*/

/*
 * 
 * At 1pm UK time every day, this script will:
 * 
 * - Handle various Exercise timeline dates like:
 *      - contactIndependentAssessors: remind Assessors to do their Assessments today and remind them 2 weeks later
 *      - independentAssessmentsReturnDate: remind Assessors to do their Assessments 1 week before this due date
 * 
 */
const NOTIFY_SCHEDULE = 'every day 13:00';

// We might have to process lots of exercises today,
// so bump up the runtime options to a bit higher normal values.
// More info here:
// https://firebase.google.com/docs/functions/manage-functions#set_timeout_and_memory_allocation
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '512MB',
};

const functions = require('firebase-functions');
const remindAssessorsToAssess = require('./remindAssessorsToAssess').remindAssessorsToAssess;
const handleExerciseApplicationCloseDate = require('./notifyAdminsWhenExerciseCloses').handleExerciseApplicationCloseDate;
const handleExerciseApplicationOpenDate = require('./notifyAdminsWhenExerciseOpens').handleExerciseApplicationOpenDate;

exports.handleExerciseTimelineDates = functions.region('europe-west2')
                                                 .runWith(runtimeOpts)
                                                 .pubsub.schedule(NOTIFY_SCHEDULE)
                                                 .timeZone('Europe/London')
                                                 .onRun((context) => {
  
  remindAssessorsToAssess();
  handleExerciseApplicationOpenDate();
  handleExerciseApplicationCloseDate();
  return null;
});

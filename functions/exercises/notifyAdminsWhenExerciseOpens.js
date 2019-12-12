/*eslint-disable no-unused-vars*/

/*
 * 
 * At 1pm UK time every day, this script will:
 * 
 * - Look for Exercises that open today (in exercises/{exerciseId}/applicationOpenDate attribute)
 * - For each of these exercises, send a notification email reminding them that their exercise is now open
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
const db = require('../sharedServices').db;
const sendEmail = require('../sharedServices').sendEmail;
const slog = require('../sharedServices').slog;

let exercisesRef = db.collection('exercises');

exports.notifyAdminsWhenExerciseOpens = functions.runWith(runtimeOpts).pubsub.schedule(NOTIFY_SCHEDULE)
  .timeZone('Europe/London')
  .onRun((context) => {

    // Use today's and yesterday's date as filters to find the proper applicationOpenDate
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
  
    slog(`SCHEDULED JOB: Looking for exercises that open today: ${today}`);

    // Look for Exercises that open today (in exercises/{exerciseId}/applicationOpenDate field)
    exercisesRef.where('applicationOpenDate', '>', yesterday).where('applicationOpenDate', '<', today).get()
    .then(snapshot => {
      if (snapshot.empty) {
        slog(`No matching documents in Exercises 
                where applicationOpenDate > ${yesterday}
                and applicationOpenDate < ${today}`);
        return;
      } 

      // For each of these exercises, send a notification email reminding them that their exercise is now open
      snapshot.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        const data = doc.data();

        const applicationOpenDate = data.applicationOpenDate;
        slog(`${data.name} applicationOpenDate = ${applicationOpenDate.toDate().toISOString().split('T')[0]}`);

        const email = data.exerciseMailbox;
        slog(`Exercise ${data.name} is now open. Emailing JAC admin: ${email}`);

        const personalizationData = {
          exerciseName: data.name,
          exerciseId: doc.id,
        };

        // Check that the firebase config has the key by running:
        // firebase functions:config:get
        //
        // Set notify.templates.exercise_open in firebase functions like this:
        // firebase functions:config:set notify.templates.exercise_open="THE_GOVUK_NOTIFY_TEMPLATE_ID"
        const templateId = functions.config().notify.templates.exercise_open;

        // TODO: Remove this later once everything works
        if (email.includes('@judicialappointments.digital')) {
          return sendEmail(email, templateId, personalizationData).then((sendEmailResponse) => {
            slog(`Exercise "${data.name}" is now open.`);
            slog(`Response from sendEmail: ${sendEmailResponse}`);
            return null;
          });
        } else {
          slog(`ERROR: Trying to send to non-JAC email address: ${email}`);
        }
      });

      return null;
    })
    .catch(err => {
      slog('Error getting documents', err);
      return null;
    });

    return null;
  });

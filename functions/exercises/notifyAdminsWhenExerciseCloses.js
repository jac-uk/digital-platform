/*eslint-disable no-unused-vars*/

/*
 * 
 * At 1pm UK time every day, this script will:
 * 
 * - Look for Exercises that close today (in exercises/{exerciseId}/applicationCloseDate attribute)
 * - For each of these exercises, send a notification email reminding them that their exercise closes today,
 *   meaning Candidates can no longer apply to this exercise (vacancy).
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

exports.notifyAdminsWhenExerciseCloses = functions.region('europe-west2')
                                                  .runWith(runtimeOpts)
                                                  .pubsub.schedule(NOTIFY_SCHEDULE)
                                                  .timeZone('Europe/London')
                                                  .onRun((context) => {

    // Use today's and yesterday's date as filters to find the proper applicationCloseDate
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
  
    slog(`SCHEDULED JOB: Looking for exercises that close today: ${today}`);

    // Look for Exercises that close today (in exercises/{exerciseId}/applicationCloseDate field)
    exercisesRef.where('applicationCloseDate', '>', yesterday).where('applicationCloseDate', '<', today).get()
    .then(snapshot => {
      if (snapshot.empty) {
        slog(`No matching documents in Exercises 
                where applicationCloseDate > ${yesterday}
                and applicationCloseDate < ${today}`);
        return;
      } 

      // For each of these exercises, send a notification email reminding them that their exercise is now closed
      snapshot.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        const data = doc.data();

        const applicationCloseDate = data.applicationCloseDate;
        slog(`${data.name} applicationCloseDate = ${applicationCloseDate.toDate().toISOString().split('T')[0]}`);

        const email = data.exerciseMailbox;
        slog(`Exercise (${data.name}) is now closed. Emailing JAC admin: ${email}`);

        const personalizationData = {
          exerciseName: data.name,
          exerciseId: doc.id,
        };

        // Check that the firebase config has the key by running:
        // firebase functions:config:get
        //
        // Set notify.templates.exercise_closed in firebase functions like this:
        // firebase functions:config:set notify.templates.exercise_closed="THE_GOVUK_NOTIFY_TEMPLATE_ID"
        const templateId = functions.config().notify.templates.exercise_closed;

        if (email.includes('@judicialappointments.digital') ||
            email.includes('@gov.uk')) {
          return sendEmail(email, templateId, personalizationData).then((sendEmailResponse) => {
            slog(`Exercise "${data.name}" is now closed.`);
            slog(`Response from sendEmail: ${sendEmailResponse}`);
            return null;
          });
        } else {
          slog(`ERROR: NotifyAdminWhenExerciseCloses: Trying to send to non-JAC email address: ${email}`);
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

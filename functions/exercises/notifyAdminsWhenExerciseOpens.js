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
  memory: '512MB'
}

const functions = require('firebase-functions');
const db = require('../sharedServices').db;
const sendEmail = require('../sharedServices').sendEmail;

const todaysDate = (new Date()).toISOString().split('T')[0];

let exercisesRef = db.collection('exercises');

exports.notifyAdminsWhenExerciseOpens = functions.runWith(runtimeOpts).pubsub.schedule(NOTIFY_SCHEDULE)
  .timeZone('Europe/London')
  .onRun((context) => {
  
    console.info(`Looking for exercises that open today: ${todaysDate}`);

    /*
    * 
    *  TODO: This is not the best way to limit the returned results from Firestore
    *  Probably the easiest way is to have an 'applicationOpenDateString' attribute
    *  so we can write a query clause like this:
    *  
    *  exercisesRef.where('applicationOpenDateString', '==', todaysDate).get()
    *  
    */

    // Look for Exercises that open today (in exercises/{exerciseId}/applicationOpenDate field)
    exercisesRef.orderBy('applicationOpenDate', 'desc').get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      } 

      // For each of these exercises, send a notification email reminding them that their exercise is now open
      snapshot.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        const data = doc.data();

        // This is a Firestore Timestamp object, not a Javascript Date, so you use toDate()
        // to turn it into one.
        const applicationOpenDate = data.applicationOpenDate;

        if (applicationOpenDate !== null) {
          const applicationOpenDateString = applicationOpenDate.toDate().toISOString().split('T')[0];

          if (todaysDate == applicationOpenDateString) {
            console.log(`${data.name} applicationOpenDate = ${applicationOpenDateString}`);

            const email = data.exerciseMailbox;
            console.log(`Exercise ${data.name} is now open. Sending email to ${email}`);

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
                console.info(`Exercise "${data.name}" - is now open.`);
                console.log(sendEmailResponse);
                return null;
              });
            } else {
              console.error(`Don't mail out to ${email}`);
            }
          }
        }
      });

      return null;
    })
    .catch(err => {
      console.log('Error getting documents', err);
      return null;
    });

    return null;
  });

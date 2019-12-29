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
const getData = require('../sharedServices').getData;


const getExercisesClosingToday = async () => {
  const today = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  slog(`SCHEDULED JOB: Looking for exercises that close today: ${today}`);

  let exercisesRef = db.collection('exercises');

  let snapshot;
  try {
    // Look for Exercises that close today (in exercises/{exerciseId}/applicationCloseDate field)
    snapshot = await exercisesRef.where('applicationCloseDate', '>', yesterday).where('applicationCloseDate', '<', today).get(); 
  } catch(err) {
    slog(`
      ERROR: Bad query: exercisesRef.where('applicationCloseDate', '>', yesterday).where('applicationCloseDate', '<', today).get() :
      ${err}
    `);
    return null;
  }

  if (snapshot.empty) {
    slog(`No matching documents in Exercises 
      where applicationCloseDate > ${yesterday}
      and applicationCloseDate < ${today}`);
    return null;
  }

  return snapshot;
};


const sendCandidateReminderEmails = async (applicationData, exerciseName) => {
  const candidateData = await getData('candidates', applicationData.userId);
  if (candidateData == null) {
    slog(`
      ERROR: No data returned from Candidates with docId = ${applicationData.userId}
    `);
    return null;
  }

  const personalizedData = {
    applicantName: candidateData.fullName,
    exerciseName: exerciseName,
  };

  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set notify.templates.notify_candidate_reminder_application_submitted in firebase functions like this:
  // firebase functions:config:set notify.templates.notify_candidate_reminder_application_submitted="THE_GOVUK_NOTIFY_TEMPLATE_ID"  
  const templateId = functions.config().notify.templates.notify_candidate_reminder_application_submitted;
  return sendEmail(candidateData.email, templateId, personalizedData).then((sendEmailResponse) => {
    slog(`
      ${candidateData.fullName} (${candidateData.email}) has previously applied to exercise ${exerciseName} 
      and we've sent them a reminder today that this exercise is closed.
    `);
    return true;
  });
};


const processApplications = async (applicationIds, exerciseName) => {
  // for each application, send them a reminder email
  applicationIds.forEach(doc => {
    const applicationData = doc.data();
    sendCandidateReminderEmails(applicationData, exerciseName);
  });

  return null;
};


const getApplications = async (exerciseId, exerciseName) => {
  let ref = db.collection('applications');

  // find applications given the exerciseId
  let snapshot;
  try {
    snapshot = await ref.where('exerciseId', '=', exerciseId).get(); 
  } 
  catch(err) {
    slog(`
      ERROR: Bad query: ref.where('exerciseId', '=', exerciseId).get() :
      ${err}
    `);
    return null;
  }

  if (snapshot.empty) {
    slog(`
      No matching documents in Applications
      where exerciseId = ${exerciseId}
    `);
    return null;
  }

  processApplications(snapshot, exerciseName);  
  return null;
};


const notifyCandidates = async (exerciseIds) => {
  // Get applications by exerciseId
  exerciseIds.forEach(doc => {
    getApplications(doc.id, doc.data().name);
  });

  return null;
};


const notifyAdmins = async (exerciseIds) => {
  exerciseIds.forEach(doc => { 
    //console.log(doc.id, '=>', doc.data());
    const data = doc.data();

    const applicationCloseDate = data.applicationCloseDate;
    slog(`
      ${data.name} applicationCloseDate = ${applicationCloseDate.toDate().toISOString().split('T')[0]}
    `);

    const email = data.exerciseMailbox;
    slog(`
      Exercise (${data.name}) is now closed. Emailing JAC admin: ${email}`
    );

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
        slog(`
          Exercise "${data.name}" is now closed.
        `);
        slog(`
          Response from sendEmail: ${sendEmailResponse}
        `);
        return null;
      });
    } else {
      slog(`
        ERROR: notifyAdmins: Trying to send to non-JAC email address: ${email}
      `);
    }        
  });
};


const handleExerciseApplicationCloseDate = async () => {
  const exercisesClosingTodayPromise = getExercisesClosingToday();
  const exercisesClosingToday = await exercisesClosingTodayPromise;
  if (exercisesClosingToday != null) {
    notifyAdmins(exercisesClosingToday);
    notifyCandidates(exercisesClosingToday);
  }

  return null;
};


exports.notifyAdminsWhenExerciseCloses = functions.region('europe-west2')
                                                  .runWith(runtimeOpts)
                                                  .pubsub.schedule(NOTIFY_SCHEDULE)
                                                  .timeZone('Europe/London')
                                                  .onRun((context) => {
    
    handleExerciseApplicationCloseDate();
    return null;
  });

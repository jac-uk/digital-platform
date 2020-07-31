const functions = require('firebase-functions');
const sendEmail = require('../sharedServices').sendEmail;
const slog = require('../sharedServices').slog;
const getExercisesWithDate = require('../sharedServices').getExercisesWithDate;


const notifyAdmins = async (exerciseIds) => {
  exerciseIds.forEach(doc => {
    //console.log(doc.id, '=>', doc.data());
    const data = doc.data();

    const applicationOpenDate = data.applicationOpenDate;
    slog(`${data.name} applicationOpenDate = ${applicationOpenDate.toDate().toISOString().split('T')[0]}`);

    const email = data.exerciseMailbox;
    if (email === null) {
      slog(`
        ERROR: Exercise ${doc.id} has no exerciseMailbox.
      `);
      return null;
    }

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

    if (email.includes('@judicialappointments.digital') ||
        email.includes('@judicialappointments.gov.uk')) {
      return sendEmail(email, templateId, personalizationData)
        .then((sendEmailResponse) => {
          slog(`Exercise "${data.name}" is now open.`);
          slog(`Response from sendEmail: ${sendEmailResponse}`);
          return null;
        });
    } else {
      slog(`
        ERROR: NotifyAdminWhenExerciseOpens: Trying to send to non-JAC email address: ${email}
      `);
      return null;
    }    

  });

  return null;
};  


const handleExerciseApplicationOpenDate = async () => {
  const exercisesOpeningTodayPromise = getExercisesWithDate('applicationOpenDate');
  const exercisesOpeningToday = await exercisesOpeningTodayPromise;
  if (exercisesOpeningToday !== null) {
    notifyAdmins(exercisesOpeningToday);
  }

  return null;
};


module.exports = {
  handleExerciseApplicationOpenDate,
};

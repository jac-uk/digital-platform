
module.exports = (config, firebase) => {

  return newNotificationQualifyingTestReminder;

  function newNotificationQualifyingTestReminder(exercise, application, qualifyingTest) {
    return {
      email: application.personalDetails.email,
      replyTo: exercise.exerciseMailbox,
      template: {
        name: 'Qualifying Test Invitation',
        id: '0ac35e21-148f-4b98-84c8-b61f1709d01d',
      },
      personalisation: {
        applicantName: application.personalDetails.fullName,
        exerciseName: exercise.name,
        testTitle: qualifyingTest.title,
        startDate: qualifyingTest.startDate.toDate().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), // @TODO this needs to nicely display date and time
        startTime: qualifyingTest.startDate.toDate().toLocaleTimeString('en-GB'),
        endDate: qualifyingTest.startDate.toDate().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        endTime: qualifyingTest.endDate.toDate().toLocaleTimeString('en-GB'),
        link: `${config.APPLY_URL}/sign-in`,
        exerciseMailbox: exercise.exerciseMailbox,
        exercisePhoneNumber: exercise.exercisePhoneNumber,
        emailSignatureName: exercise.emailSignatureName,
      },
      reference: {
        collection: 'qualifyingTestResponses',
        id: application.id,
      },
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      status: 'ready',
    };
  }

};

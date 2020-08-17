
module.exports = (firebase, config) => {

  return newQualifyingTestResponse;

  function newQualifyingTestResponse(qualifyingTest, applicationRecord) {
    return {
      qualifyingTest: {
        id: qualifyingTest.id,
        type: qualifyingTest.type,
        title: qualifyingTest.title,
        startDate: qualifyingTest.startDate,
        endDate: qualifyingTest.endDate,
        additionalInstructions: qualifyingTest.additionalInstructions,
      },
      application: {
        id: applicationRecord.application.id,
        referenceNumber: applicationRecord.application.referenceNumber,
      },
      candidate: {
        id: applicationRecord.candidate.id,
      },
      vacancy: {
        id: applicationRecord.exercise.id,
      },
      duration: {
        testDuration: 45,
        reasonableAdjustment: 0, // @TODO calculate reasonable adjustment
        testDurationAdjusted: 45,
      },
      testQuestions: [],
      created: firebase.firestore.Timestamp.fromDate(new Date()),
      lastUpdated: null,
      started: null,
      completed: null,
      status: config.QUALIFYINGTESTRESPONSES_STATUS.CREATED,
    };
  }
}

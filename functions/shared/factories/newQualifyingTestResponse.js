
module.exports = (config, firebase) => {

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
        questions: [],
      },
      application: {
        id: applicationRecord.application.id,
        referenceNumber: applicationRecord.application.referenceNumber,
      },
      candidate: {
        id: applicationRecord.candidate.id,
        fullName: applicationRecord.candidate.fullName,
        reasonableAdjustments: applicationRecord.candidate.reasonableAdjustments,
        reasonableAdjustmentsDetails: applicationRecord.candidate.reasonableAdjustmentsDetails,
      },
      vacancy: {
        id: applicationRecord.exercise.id,
      },
      duration: {
        testDuration: qualifyingTest.testDuration,
        reasonableAdjustment: 0,
        testDurationAdjusted: qualifyingTest.testDuration,
      },
      responses: [],
      statusLog: {
        created: firebase.firestore.Timestamp.fromDate(new Date()),
        activated: null,
        started: null,
        completed: null,
      },
      status: config.QUALIFYINGTESTRESPONSES_STATUS.CREATED,
      lastUpdated: firebase.firestore.Timestamp.fromDate(new Date()),
    };
  }
}

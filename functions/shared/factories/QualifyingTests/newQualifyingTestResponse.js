
module.exports = (config, firebase) => {

  return newQualifyingTestResponse;

  function newQualifyingTestResponse(qualifyingTest, inputData) {
    const data = {
      qualifyingTest: {
        id: qualifyingTest.id,
        type: qualifyingTest.type,
        isTieBreaker: qualifyingTest.isTieBreaker ? qualifyingTest.isTieBreaker : false,
        title: qualifyingTest.title,
        startDate: qualifyingTest.startDate,
        endDate: qualifyingTest.endDate,
        additionalInstructions: qualifyingTest.additionalInstructions,
        // questions: [],  // @TODO move questions here instead of testQuestions
      },
      testQuestions: [],
      duration: {
        testDuration: qualifyingTest.testDuration,
        reasonableAdjustment: 0,
        testDurationAdjusted: qualifyingTest.testDuration,
      },
      responses: [],
      statusLog: {
        created: firebase.firestore.FieldValue.serverTimestamp(),
        activated: null,
        started: null,
        completed: null,
      },
      status: config.QUALIFYING_TEST_RESPONSES.STATUS.CREATED,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (qualifyingTest.mode === 'dry-run') {
      data.candidate = {
        email: inputData.toLowerCase(),
        id: null,
        fullName: null,
        reasonableAdjustments: false,
      };
    } else {
      if (inputData.application) {
        data.application = {
          id: inputData.application.id,
          referenceNumber: inputData.application.referenceNumber,
        };
      }
      if (inputData.candidate) {
        data.candidate = {
          id: inputData.candidate.id,
          fullName: inputData.candidate.fullName,
          reasonableAdjustments: inputData.candidate.reasonableAdjustments ? true : false,
          reasonableAdjustmentsDetails: inputData.candidate.reasonableAdjustmentsDetails ? inputData.candidate.reasonableAdjustmentsDetails : null,
        };
      }
      if (inputData.exercise) {
        data.vacancy = {
          id: inputData.exercise.id,
        };
      }
    }
    return data;
  }
};

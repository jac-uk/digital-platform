const { getDocument } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const newQualifyingTestResponse = require('../../shared/factories/QualifyingTests/newQualifyingTestResponse')(config, firebase);
  const newQuestionsWithoutSolutions = require('../../shared/factories/QualifyingTests/newQuestionsWithoutSolutions')();

  return createIndividualTest;

  /**
  * createIndividualTest
  * Creates a qualifyingTestResponse document for the specified application and test
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  *   `applicationId` (required) ID of application
  *   `activate` (optional) boolean to indicate whether to activate the test
  */
  async function createIndividualTest(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));

    // get application
    const application = await getDocument(db.collection('applicationRecords').doc(params.applicationId));

    const data = newQualifyingTestResponse(qualifyingTest, application);
    if (params.activate) {
      data.testQuestions = newQuestionsWithoutSolutions(qualifyingTest.testQuestions);
      data.qualifyingTest.additionalInstructions = qualifyingTest.additionalInstructions;
      data.qualifyingTest.feedbackSurvey = qualifyingTest.feedbackSurvey;
      data.qualifyingTest.startDate = qualifyingTest.startDate;
      data.qualifyingTest.endDate = qualifyingTest.endDate;
      data.status = config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED;
      data.statusLog.activated = firebase.firestore.FieldValue.serverTimestamp();
      data.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
    }
    const result = await db.collection('qualifyingTestResponses').doc().set(data);
    return result;

  }

};

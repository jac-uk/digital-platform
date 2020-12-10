const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const newQuestionsWithoutSolutions = require('../../shared/factories/QualifyingTests/newQuestionsWithoutSolutions')();

  return activateQualifyingTest;

  /**
  * activateQualifyingTest
  * Activates qualifying test by:
  * - copying test questions to each qualifyingTestResponse document
  * - updating the status and counts of qualifyingTest document
  * - @TODO emailing each candidate invited to the qualifying test
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  */
  async function activateQualifyingTest(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));

    // get qualifying test questions without answers!
    const questions = newQuestionsWithoutSolutions(qualifyingTest.testQuestions);

    // get qualifying test responses
    let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      .where('status', '==', config.QUALIFYING_TEST_RESPONSES.STATUS.CREATED)
      .select('application.id');
    const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

    // construct db commands
    const commands = [];
    for (let i = 0, len = qualifyingTestResponses.length; i < len; ++i) {
      const qualifyingTestResponse = qualifyingTestResponses[i];
      commands.push({
        command: 'update',
        ref: db.collection('qualifyingTestResponses').doc(`${qualifyingTestResponse.id}`),
        data: {
          // 'qualifyingTest.questions': questions, // @TODO store questions here instead of `testQuestions`
          'testQuestions': questions,
          'qualifyingTest.additionalInstructions': qualifyingTest.additionalInstructions,
          'qualifyingTest.feedbackSurvey': qualifyingTest.feedbackSurvey,
          status: config.QUALIFYING_TEST_RESPONSES.STATUS.ACTIVATED,
          'statusLog.activated': firebase.firestore.FieldValue.serverTimestamp(),
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // update qualifying test status and counts
    commands.push({
      command: 'update',
      ref: qualifyingTest.ref,
      data: {
        status: config.QUALIFYING_TEST.STATUS.ACTIVATED,
        'counts.activated': qualifyingTestResponses.length,
      },
    });

    // // write to db
    const result = await applyUpdates(db, commands);

    // @TODO send notifications

    // return
    return result ? qualifyingTestResponses.length : false;

  }

};

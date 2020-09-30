const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const newResponsesWithScores = require('../../shared/factories/QualifyingTests/newResponsesWithScores')(config);

  return scoreQualifyingTest;

  /**
  * scoreQualifyingTest
  * Scores the qualifying test by:
  * - getting test questions and answers
  * - looping through responses and for each one 
  *   - marking the answers
  *   - populating the 'score'
  *   - identifying whether the candidate completed the test or ran out of time
  * - updating qualifyingTest document with some stats around score (average, highest, lowest, mode)
  * - updating qualifyingTest status to completed
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  */
  async function scoreQualifyingTest(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));

    // get qualifying test responses
    let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      // .where('activated', '==', null)
      .select('responses');
    const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

    // construct db commands
    const commands = [];
    const scores = [];
    const questionsCompleted = [];
    for (let i = 0, len = qualifyingTestResponses.length; i < len; ++i) {
      const qualifyingTestResponse = qualifyingTestResponses[i];
      const responsesWithScores = newResponsesWithScores(qualifyingTest, qualifyingTestResponse);
      const score = getScore(responsesWithScores);
      const totalQuestionsStarted = getTotalQuestionsStarted(responsesWithScores);
      const totalQuestionsCompleted = getTotalQuestionsCompleted(responsesWithScores);
      scores.push(score);
      questionsCompleted.push(totalQuestionsCompleted);
      commands.push({
        command: 'update',
        ref: qualifyingTestResponse.ref,
        data: {
          responses: responsesWithScores,
          score: score,
          questionsStarted: totalQuestionsStarted,
          questionsCompleted: totalQuestionsCompleted,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // update qualifying test status and counts
    commands.push({
      command: 'update',
      ref: qualifyingTest.ref,
      data: {
        status: config.QUALIFYING_TEST.STATUS.COMPLETED,
        results: {
          scores: scores,
          questionsCompleted: questionsCompleted,
        },
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? qualifyingTestResponses.length : false;

  }

  function getScore(responses) {
    let totalScore = 0;
    responses.forEach(response => {
      if (response && response.score) {
        totalScore += response.score;
      }
    });
    return totalScore;
  }

  function getTotalQuestionsStarted(responses) {
    let totalQuestionsStarted = 0;
    responses.forEach(response => {
      if (response && response.started) {
        totalQuestionsStarted++;
      }
    });
    return totalQuestionsStarted;
  }

  function getTotalQuestionsCompleted(responses) {
    let totalQuestionsCompleted = 0;
    responses.forEach(response => {
      if (response && response.completed) {
        totalQuestionsCompleted++;
      }
    });
    return totalQuestionsCompleted;
  }

}

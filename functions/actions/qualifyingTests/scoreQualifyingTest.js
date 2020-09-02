const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {
  const newQuestionsWithScoredAnswers = require('../../shared/factories/QualifyingTests/newQuestionsWithScoredAnswers')(config);

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
      .select('testQuestions');
    const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

    // construct db commands
    const commands = [];
    const scores = [];
    const questionsCompleted = [];
    for (let i = 0, len = qualifyingTestResponses.length; i < len; ++i) {
      const qualifyingTestResponse = qualifyingTestResponses[i];
      const questionsWithMarks = newQuestionsWithScoredAnswers(qualifyingTest, qualifyingTestResponse);
      const score = getScore(questionsWithMarks);
      const totalQuestionsStarted = getTotalQuestionsStarted(questionsWithMarks);
      const totalQuestionsCompleted = getTotalQuestionsCompleted(questionsWithMarks);
      scores.push(score);
      questionsCompleted.push(totalQuestionsCompleted);
      commands.push({
        command: 'update',
        ref: qualifyingTestResponse.ref,
        data: {
          'testQuestions.questions': questionsWithMarks,
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

  function getScore(questions) {
    let totalScore = 0;
    questions.forEach(question => {
      if (question.response && question.response.score) {
        totalScore += question.response.score;
      }
    });
    return totalScore;
  }

  function getTotalQuestionsStarted(questions) {
    let totalQuestionsStarted = 0;
    questions.forEach(question => {
      if (question.response && question.response.started) {
        totalQuestionsStarted++;
      }
    });
    return totalQuestionsStarted;
  }

  function getTotalQuestionsCompleted(questions) {
    let totalQuestionsCompleted = 0;
    questions.forEach(question => {
      if (question.response && question.response.completed) {
        totalQuestionsCompleted++;
      }
    });
    return totalQuestionsCompleted;
  }

}

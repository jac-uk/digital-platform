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
  *   - updating the corresponding application record with score for this QT
  * - updating qualifyingTest document with some stats around score (average, highest, lowest, mode)
  * - updating qualifyingTest status to completed
  * @param {*} `params` is an object containing
  *   `qualifyingTestId` (required) ID of qualifying test
  */
  async function scoreQualifyingTest(params) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));
    const mainQualifyingTestId = qualifyingTest.mode === config.QUALIFYING_TEST.MODE.MOP_UP ? qualifyingTest.relationship.copiedFrom : qualifyingTest.id;

    // get qualifying test responses
    let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      // .where('activated', '==', null)
      .select('responses', 'testQuestions', 'application', 'status');
    const qualifyingTestResponses = await getDocuments(qualifyingTestResponsesRef);

    // construct db commands
    const commands = [];
    const scores = [];
    const questionsCompleted = [];
    for (let i = 0, len = qualifyingTestResponses.length; i < len; ++i) {
      const qualifyingTestResponse = qualifyingTestResponses[i];
      const data = {};
      let score = null;
      // Add scores (not for scenario tests as these are manually scored)
      if (qualifyingTest.type !== config.QUALIFYING_TEST.TYPE.SCENARIO) {
        const responsesWithScores = newResponsesWithScores(qualifyingTest, qualifyingTestResponse);
        score = getScore(responsesWithScores);
        const totalQuestionsStarted = getTotalQuestionsStarted(responsesWithScores);
        const totalQuestionsCompleted = getTotalQuestionsCompleted(responsesWithScores);
        data.responses = responsesWithScores;
        data.score = score;
        data.questionsStarted = totalQuestionsStarted;
        data.questionsCompleted = totalQuestionsCompleted;
        scores.push(score);
        questionsCompleted.push(totalQuestionsCompleted);
      }
      // Mark any tests still in progress as completed & out of time
      if (qualifyingTestResponse.status === config.QUALIFYING_TEST_RESPONSES.STATUS.STARTED) {
        data.isOutOfTime = true;
        data.status = config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED;
        data['statusLog.completed'] = qualifyingTest.endDate;
      }
      if (Object.keys(data).length > 0) {
        data.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
        commands.push({
          command: 'update',
          ref: qualifyingTestResponse.ref,
          data: data,
        });
      }
      // update corresponding application record, if we have one (dry run won't)
      if (qualifyingTestResponse.application && qualifyingTestResponse.application.id) {
        const applicationRecordData = {};
        applicationRecordData[`qualifyingTests.${mainQualifyingTestId}`] = {
          hasData: true,
          responseId: qualifyingTestResponse.id,
          score: score,
          status: qualifyingTestResponse.status,
          pass: null,
          rank: null,
        };
        commands.push({
          command: 'update',
          ref: db.doc(`applicationRecords/${qualifyingTestResponse.application.id}`),
          data: applicationRecordData,
        });
      }
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

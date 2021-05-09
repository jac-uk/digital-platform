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

    const responsesReport = newQualifyingTestResponsesReport(qualifyingTest);

    // get qualifying test responses
    let qualifyingTestResponsesRef = db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTest.id)
      // .where('activated', '==', null)
      .select('responses', 'testQuestions', 'application', 'status', 'duration', 'statusLog');
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
        updateResponsesReport(qualifyingTest, responsesReport, responsesWithScores);
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
        const testDurationAdjusted = qualifyingTestResponse.duration.testDurationAdjusted;
        const started = new Date(qualifyingTestResponse.statusLog.started.toDate());
        const ended = new Date(started.getTime() + (testDurationAdjusted * 60000));
        const endedTimestamp = firebase.firestore.Timestamp.fromDate(ended);
        data.isOutOfTime = true;
        data.exitedTest = true;
        data.status = config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED;
        if (qualifyingTest.endDate.toMillis() < endedTimestamp.toMillis()) {
          data['statusLog.completed'] = qualifyingTest.endDate;  
        } else {
          data['statusLog.completed'] = endedTimestamp;
        }
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
        responsesReport: responsesReport,
      },
    });

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? qualifyingTestResponses.length : false;

  }

  function newQualifyingTestResponsesReport(qualifyingTest) {
    const report = {
      responses: 0,
      questions: {},
    };
    if (qualifyingTest) {
      qualifyingTest.testQuestions.questions.forEach((question, questionIndex) => {
        const questionReport = {
          responses: 0,
          correct: 0,
          incorrect: 0,
          answers: {},
        };
        if (qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT) {
          questionReport.partial = 0;
        }
        question.options.forEach((answer, answerIndex) => {
          const answerReport = {};
          switch (qualifyingTest.type) {
          case config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
            answerReport.mostAppropriate = 0;
              answerReport.leastAppropriate = 0;
            break;
          case config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
            answerReport.selected = 0;
            break;
          }
          questionReport.answers[answerIndex] = answerReport;
        });
        report.questions[questionIndex] = questionReport;
      });
    }
    return report;
  }

  function updateResponsesReport(qualifyingTest, responsesReport, responses) {
    responsesReport.responses++;
    responses.forEach((response, questionIndex) => {
      if (response.started && response.completed) {
        responsesReport.questions[questionIndex].responses++;
        switch (qualifyingTest.type) {
        case config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
          if (response.score === 2) {
            responsesReport.questions[questionIndex].correct++;
          } else if (response.score === 1) {
            responsesReport.questions[questionIndex].partial++;
          } else {
            responsesReport.questions[questionIndex].incorrect++;
          }
          if (response.selection && response.selection.mostAppropriate !== null && response.selection.leastAppropriate !== null) {
            responsesReport.questions[questionIndex].answers[response.selection.mostAppropriate].mostAppropriate++;
            responsesReport.questions[questionIndex].answers[response.selection.leastAppropriate].leastAppropriate++;
          }
          break;
        case config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
          if (response.score === 1) {
            responsesReport.questions[questionIndex].correct++;
          } else {
            responsesReport.questions[questionIndex].incorrect++;
          }
          responsesReport.questions[questionIndex].answers[response.selection].selected++;
          break;
        }
      }
    });
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

};

// TODO See digital-platform#482

// const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

// module.exports = (config, firebase, db) => {

//   return importQualifyingTestScores;

//   /**
//   * importQualifyingTestScores
//   * @param {*} `scores` (required) is a json object containing the scores
//   *   `qualifyingTestId` (required) ID of qualifying test
//   */
//   async function importQualifyingTestScores(params) {

//     // get qualifying test
//     const qualifyingTest = await getDocument(db.doc(`qualifyingTests/${params.qualifyingTestId}`));
//     const mainQualifyingTestId = qualifyingTest.mode === config.QUALIFYING_TEST.MODE.MOP_UP ? qualifyingTest.relationship.copiedFrom : qualifyingTest.id;

//     // process json


//     // get application records


//     // identify any application records we can't find


//     // construct db commands
//     const commands = [];
//     const scores = [];
//     const questionsCompleted = [];

//       // update corresponding application record, if we have one (dry run won't)
//       if (qualifyingTestResponse.application && qualifyingTestResponse.application.id) {
//         const applicationRecordData = {};
//         applicationRecordData[`qualifyingTests.${mainQualifyingTestId}`] = {
//           hasData: true,
//           responseId: qualifyingTestResponse.id,
//           score: score,
//           status: qualifyingTestResponse.status,
//           pass: null,
//           rank: null,
//         };
//         commands.push({
//           command: 'update',
//           ref: db.doc(`applicationRecords/${qualifyingTestResponse.application.id}`),
//           data: applicationRecordData,
//         });
//       }
//     }

//     // update qualifying test status and counts
//     commands.push({
//       command: 'update',
//       ref: qualifyingTest.ref,
//       data: {
//         status: config.QUALIFYING_TEST.STATUS.COMPLETED,
//         results: {
//           scores: scores,
//           questionsCompleted: questionsCompleted,
//         },
//         responsesReport: responsesReport,
//       },
//     });

//     // write to db
//     const result = await applyUpdates(db, commands);

//     // return
//     return result ? qualifyingTestResponses.length : false;

//   }

//   function newQualifyingTestResponsesReport(qualifyingTest) {
//     const report = {
//       responses: 0,
//       questions: {},
//     };
//     if (qualifyingTest) {
//       qualifyingTest.testQuestions.questions.forEach((question, questionIndex) => {
//         const questionReport = {
//           responses: 0,
//           correct: 0,
//           incorrect: 0,
//           answers: {},
//         };
//         if (qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT) {
//           questionReport.partial = 0;
//         }
//         question.options.forEach((answer, answerIndex) => {
//           const answerReport = {};
//           switch (qualifyingTest.type) {
//             case config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
//               answerReport.mostAppropriate = 0;
//               answerReport.leastAppropriate = 0;
//               break;
//             case config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
//               answerReport.selected = 0;
//               break;
//           }
//           questionReport.answers[answerIndex] = answerReport;
//         });
//         report.questions[questionIndex] = questionReport;
//       });
//     }
//     return report;
//   }

//   function updateResponsesReport(qualifyingTest, responsesReport, responses) {
//     responsesReport.responses++;
//     responses.forEach((response, questionIndex) => {
//       if (response.started && response.completed) {
//         responsesReport.questions[questionIndex].responses++;
//         switch (qualifyingTest.type) {
//           case config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
//             if (response.score === 2) {
//               responsesReport.questions[questionIndex].correct++;
//             } else if (response.score === 1) {
//               responsesReport.questions[questionIndex].partial++;
//             } else {
//               responsesReport.questions[questionIndex].incorrect++;
//             }
//             if (response.selection && response.selection.mostAppropriate !== null && response.selection.leastAppropriate !== null) {
//               responsesReport.questions[questionIndex].answers[response.selection.mostAppropriate].mostAppropriate++;
//               responsesReport.questions[questionIndex].answers[response.selection.leastAppropriate].leastAppropriate++;
//             }
//             break;
//           case config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
//             if (response.score === 1) {
//               responsesReport.questions[questionIndex].correct++;
//             } else {
//               responsesReport.questions[questionIndex].incorrect++;
//             }
//             responsesReport.questions[questionIndex].answers[response.selection].selected++;
//             break;
//         }
//       }
//     });
//   }

//   function getScore(responses) {
//     let totalScore = 0;
//     responses.forEach(response => {
//       if (response && response.score) {
//         totalScore += response.score;
//       }
//     });
//     return totalScore;
//   }

//   function getTotalQuestionsStarted(responses) {
//     let totalQuestionsStarted = 0;
//     responses.forEach(response => {
//       if (response && response.started) {
//         totalQuestionsStarted++;
//       }
//     });
//     return totalQuestionsStarted;
//   }

//   function getTotalQuestionsCompleted(responses) {
//     let totalQuestionsCompleted = 0;
//     responses.forEach(response => {
//       if (response && response.completed) {
//         totalQuestionsCompleted++;
//       }
//     });
//     return totalQuestionsCompleted;
//   }

// };

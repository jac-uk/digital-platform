'use strict';

const config = require('./shared/config.js');
const { app, db } = require('./shared/admin.js');
const { getDocument } = require('../functions/shared/helpers');


const main = async () => {

  const qualifyingTestId = 'VnxfyYqV5NfLFheEbOjf';

  // get data
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));

  // question report
  const questionData = [];
  qualifyingTest.testQuestions.questions.forEach((question, questionIndex) => {
    const rowData = {
      questionNumber: questionIndex + 1,
      questionResponses: qualifyingTest.responsesReport.questions[questionIndex].responses,
      correct: qualifyingTest.responsesReport.questions[questionIndex].correct,
      incorrect: qualifyingTest.responsesReport.questions[questionIndex].incorrect,
    };
    if (qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT) {
      rowData.partial = qualifyingTest.responsesReport.questions[questionIndex].partial;
    }
    questionData.push(rowData);
  });

  // answer report
  const answerData = [];
  qualifyingTest.testQuestions.questions.forEach((question, questionIndex) => {
    question.options.forEach((answer, answerIndex) => {
      const rowData = qualifyingTest.responsesReport.questions[questionIndex].answers[answerIndex];
      rowData.questionNumber = questionIndex + 1;
      rowData.answerNumber = answerIndex + 1;
      rowData.questionResponses = qualifyingTest.responsesReport.questions[questionIndex].responses;
      answerData.push(rowData);
    });
  });

  const createCsvWriter = require('csv-writer').createObjectCsvWriter;

  const questionReportHeaders = [
    { id: 'questionNumber', title: 'Question' },
    { id: 'questionResponses', title: 'Responses' },
    { id: 'correct', title: 'Correct' },
    { id: 'incorrect', title: 'Incorrect' },
  ];
  if (qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT) {
    questionReportHeaders.push({ id: 'partial', title: 'Partial' });
  }
  const questionReport = createCsvWriter({
    path: 'questionReport.csv',
    header: questionReportHeaders,
  });
  await questionReport.writeRecords(questionData);

  const answerReportHeaders = [
    { id: 'questionNumber', title: 'Question' },
    { id: 'answerNumber', title: 'Answer' },
    { id: 'questionResponses', title: 'Responses' },
  ];
  if (qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT) {
    answerReportHeaders.push({ id: 'mostAppropriate', title: 'Selected as Most Appropriate' });
    answerReportHeaders.push({ id: 'leastAppropriate', title: 'Selected as Least Appropriate' });
  } else {
    answerReportHeaders.push({ id: 'selected', title: 'Selected' });
  }
  const answerReport = createCsvWriter({
    path: 'answerReport.csv',
    header: answerReportHeaders,
  });
  await answerReport.writeRecords(answerData);

  return true;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });

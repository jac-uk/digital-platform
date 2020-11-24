'use strict';

const config = require('./shared/config.js');
const { firebase, app, db } = require('./shared/admin.js');
const { applyUpdates, getDocuments, getDocument } = require('../functions/shared/helpers');

function mockResponses(type, numQuestions, numAnswers) {
  const responses = [];
  switch(type) {
  case config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
    for (let i = 0; i < numQuestions; ++i) {
      responses.push({
        started: new Date(),
        completed: new Date(),
        selection: randomIntFromInterval(0, numAnswers-1),
      });
    }
    break;
    case config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
      for (let i = 0; i < numQuestions; ++i) {
        responses.push({
          started: new Date(),
          completed: new Date(),
          selection: {
            mostAppropriate: randomIntFromInterval(0, numAnswers - 1),
            leastAppropriate: randomIntFromInterval(0, numAnswers - 1),
          },
        });
      }
      break;
  }
  return responses;
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const main = async () => {

  const qualifyingTestId = 'pzxPdlbEJ5Vf3kCJeP6w';

  // get qualifyingTest
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));

  // get qualifyingTestResponses
  const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses').where('qualifyingTest.id', '==', qualifyingTestId));

  // loop and create amended clone applications
  const commands = [];
  for (let i = 0, len = qualifyingTestResponses.length; i < len; ++i) {
    const qualifyingTestResponse = qualifyingTestResponses[i];
    commands.push({
      command: 'update',
      ref: qualifyingTestResponse.ref,
      data: {
        status: config.QUALIFYING_TEST_RESPONSES.STATUS.COMPLETED,
        'statusLog.started': firebase.firestore.FieldValue.serverTimestamp(),
        'statusLog.completed': firebase.firestore.FieldValue.serverTimestamp(),
        responses: mockResponses(qualifyingTest.type, 15, 4),
      },
    });
  }

  // add to db
  const result = await applyUpdates(db, commands);
  return result;
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

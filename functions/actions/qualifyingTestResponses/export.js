const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocument, getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    exportQualifyingTestResponses,
  };

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {uuid} qualifyingTestId
   */
  async function exportQualifyingTestResponses(qualifyingTestId) {

    // get qualifying test
    const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc(qualifyingTestId));

    // get responses
    const qualifyingTestResponses = await getDocuments(db.collection('qualifyingTestResponses')
      .where('qualifyingTest.id', '==', qualifyingTestId)
    );

    const report = {
      headers: getHeaders(qualifyingTest),
      rows: getData(qualifyingTest, qualifyingTestResponses),
    };

    return report;
  }
};

const getHeaders = (qualifyingTest) => {
  const headers = [
    'ID',
    'Reference number',
    'Full Name',
    'Total Duration',
    'Adjust applied',
    'Time Taken',
    'Status',
    'Started',
    'Completed',
    `${typeInitials(qualifyingTest.type)} Score`,
  ];

  qualifyingTest.testQuestions.questions.forEach((question, index) => {
    if (qualifyingTest.type === QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT) {
      headers.push(
        `Q${ index + 1 }. Most Appropriate`,
        `Q${ index + 1 }. Least Appropriate`,
        `Q${ index + 1 }. Score`
      );
    }
    if (qualifyingTest.type === QUALIFYING_TEST.TYPE.SCENARIO) {
      question.options.forEach((option, decimal) => {
        headers.push(`Scenario ${ index + 1 }. Question ${ decimal + 1 }: ${ option.question }`);
      });
    }
    if (qualifyingTest.type === QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS) {
      headers.push(
        `Q${ index + 1 }. Answer`,
        `Q${ index + 1 }. Score`
      );
    }
  });

  return headers;
};

const getData = (qualifyingTest, qualifyingTestResponses) => {

  const sortedByScoresArr = qualifyingTestResponses.slice().sort((a, b) => {return a.score - b.score;}).reverse();

  return sortedByScoresArr.map(element => {
    const row = [
      element.id,
      element.application ? element.application.referenceNumber : '',
      element.candidate.fullName || element.candidate.email,
      element.duration.testDurationAdjusted,
      element.duration.reasonableAdjustment,
      timeTaken(element),
      element.status,
      helpers.formatDate(element.statusLog.started, 'longdatetime'),
      helpers.formatDate(element.statusLog.completed, 'longdatetime'),
      element.score,
    ];

    switch (qualifyingTest.type){
    case QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
      qualifyingTest.testQuestions.questions.forEach((question, index) => {
        let response = [];
        if (element.responses.length) {
          response = element.responses[index];
        } else {
          if (element.testQuestions && element.testQuestions.questions) {
            response = element.testQuestions.questions[index].response;
          }
        }
        if (response) {
          const responseSelection = response.selection;
          if (responseSelection) {
            if ((responseSelection.mostAppropriate !== undefined && responseSelection.mostAppropriate !== null)
              && (responseSelection.leastAppropriate !== undefined && responseSelection.leastAppropriate !== null))
            {
              row.push(
                question.options[responseSelection.mostAppropriate].answer,
                question.options[responseSelection.leastAppropriate].answer,
                response.score
              );
            } else {
              row.push(
                '---',
                '---',
                '---'
              );
            }
          } else {
            row.push(
              '---',
              '---',
              '---'
            );
          }
        } else {
          row.push(
            '---',
            '---',
            '---'
          );
        }
      });
      break;
    case QUALIFYING_TEST.TYPE.SCENARIO:
      qualifyingTest.testQuestions.questions.forEach((question, index) => {
        let responses = [];
        if (element.responses.length) {
          responses = element.responses[index].responsesForScenario;
        } else {
          if (element.testQuestions && element.testQuestions.questions) {
            responses = element.testQuestions.questions[index].responses;
          }
        }
        if (responses) {
          responses.forEach((response) => {
            row.push(response.text === undefined || response.text === null ? 'Question skipped' : response.text);
          });
        }
      });
      break;
    case QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
      qualifyingTest.testQuestions.questions.forEach((question, index) => {
        let response = [];
        if (element.responses.length) {
          response = element.responses[index];
        } else {
          if (element.testQuestions && element.testQuestions.questions) {
            response = element.testQuestions.questions[index].response;
          }
        }
        if (response) {
          const responseSelection = response.selection;
          if (responseSelection !== undefined && responseSelection !== null) {
            row.push(
              question.options[response.selection].answer,
              response.score
            );
          } else {
            row.push('---','---');
          }
        } else {
          row.push('---','---');
        }
      });
      break;
    }
    return row;
  });
};

const QUALIFYING_TEST = {
  TYPE: {
    SCENARIO: 'scenario',
    CRITICAL_ANALYSIS: 'critical-analysis',
    SITUATIONAL_JUDGEMENT: 'situational-judgement',
  },
  MODE: {
    DRY_RUN: 'dry-run',
    MOP_UP: 'mop-up',
  },
  STATUS: {
    CREATED: 'created',
    SUBMITTED: 'submitted-for-approval',
    APPROVED: 'approved',
    INITIALISED: 'initialised',
    ACTIVATED: 'activated',
    PAUSED: 'paused',
    STARTED: 'started',
    PROGRESS: 'in-progress',
    COMPLETED: 'completed',
  },
};

const typeInitials = (string) => {
  let result;
  const strArray = string.split('-');
  if (strArray.length === 1) {
    result =  'SC';
  } else {
    result = `${strArray[0].charAt(0)}${strArray[strArray.length - 1].charAt(0)}`;
  }
  return result.toUpperCase();
};

const timeTaken = (response) => {
  let diff = 0;
  if (response.statusLog.completed && response.statusLog.started) {
    diff = response.statusLog.completed - response.statusLog.started;
  }
  const newDate = new Date(diff);
  const hh = `0${newDate.getUTCHours()}`.slice(-2);
  const mm = `0${newDate.getUTCMinutes()}`.slice(-2);
  const ss = `0${newDate.getUTCSeconds()}`.slice(-2);
  const returnTimeTaken = `${hh}:${mm}:${ss}`;
  return returnTimeTaken;
};

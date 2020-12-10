
module.exports = (config) => {

  return newResponsesWithScores;

  function newResponsesWithScores(qualifyingTest, qualifyingTestResponse) {
    const responses = [];
    if (
      qualifyingTestResponse &&
      qualifyingTestResponse.testQuestions &&
      qualifyingTestResponse.testQuestions.questions
    ) {
      let questions = [...qualifyingTestResponse.testQuestions.questions];
      questions.forEach((question, questionIndex) => {
        let response;
        if (qualifyingTestResponse.responses && qualifyingTestResponse.responses.length) {
          response = qualifyingTestResponse.responses[questionIndex];
        } else if (question.response) {
          response = question.response;
        } else {
          response = {
            selection: qualifyingTest.type === config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT ? {} : null,
            started: null,
            completed: null,
          };
        }
        switch (qualifyingTest.type) {
          case config.QUALIFYING_TEST.TYPE.SCENARIO:
            break;
          case config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
            if (response && response.selection) {
              response.score = 0;
              if (response.selection.mostAppropriate === qualifyingTest.testQuestions.questions[questionIndex].mostAppropriate) {
                response.score++;
              }
              if (response.selection.leastAppropriate === qualifyingTest.testQuestions.questions[questionIndex].leastAppropriate) {
                response.score++;
              }
            }
            break;
          case config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
            if (response && response.selection >= 0) {
              response.score = 0;
              if (response.selection === qualifyingTest.testQuestions.questions[questionIndex].correct) {
                response.score++;
              }
            }
            break;
        }
        responses.push(response);
      });
    }
    return responses;
  }

};

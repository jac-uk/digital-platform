
module.exports = (config) => {

  return newResponsesWithScores;

  function newResponsesWithScores(qualifyingTest, qualifyingTestResponse) {
    const responses = [...qualifyingTestResponse.responses];
    responses.forEach((response, questionIndex) => {
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
    });
    return responses;
  }

}

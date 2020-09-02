
module.exports = (config) => {

  return newQuestionsWithScoredAnswers;

  function newQuestionsWithScoredAnswers(qualifyingTest, qualifyingTestResponse) {
    const questions = [...qualifyingTestResponse.testQuestions.questions];
    questions.forEach((question, questionIndex) => {
      switch (qualifyingTest.type) {
        case config.QUALIFYING_TEST.TYPE.SCENARIO:
          break;
        case config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT:
          if (question.response && question.response.selection) {
            question.response.score = 0;
            if (question.response.selection.mostAppropriate === qualifyingTest.testQuestions.questions[questionIndex].mostAppropriate) {
              question.response.score++;
            }
            if (question.response.selection.leastAppropriate === qualifyingTest.testQuestions.questions[questionIndex].leastAppropriate) {
              question.response.score++;
            }
          }
          break;
        case config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS:
          if (question.response && question.response.selection >= 0) {
            question.response.score = 0;
            if (question.response.selection === qualifyingTest.testQuestions.questions[questionIndex].correct) {
              question.response.score++;
            }
          }
          break;
      }
    });
    return questions;
  }

}

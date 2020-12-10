
module.exports = () => {

  return newQuestionsWithoutSolutions;

  function newQuestionsWithoutSolutions(questions) {
    const questionsWithoutSolutions = { ...questions };
    questionsWithoutSolutions.questions = [];
    for (let i = 0, len = questions.questions.length; i < len; ++i) {
      const question = questions.questions[i];
      const questionWithoutSolution = {};
      Object.keys(question).forEach(key => {
        switch (key) {
          case 'mostAppropriate':
          case 'leastAppropriate':
          case 'correct':
            break;
          default:
            questionWithoutSolution[key] = question[key];
        }
      });
      questionsWithoutSolutions.questions.push(questionWithoutSolution);
    }
    return questionsWithoutSolutions;
  }

};

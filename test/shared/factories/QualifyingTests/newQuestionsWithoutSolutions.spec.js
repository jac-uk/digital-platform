const newQuestionsWithoutSolutions = require('../../../../functions/shared/factories/QualifyingTests/newQuestionsWithoutSolutions')();

describe('newQuestionsWithoutSolutions(questions)', () => {

  it('returns passed in data without changes', async () => {
    const questions = {
      introduction: 'Hello',
      questions: [
        {
          'type': 'situational-judgement',
          'details': 'I am the first question',
          'options': [
            'I am the first option',
            'I am the second option',
            'I am the third option',
            'I am the fourth option',
          ],
        },
      ],
    };
    const result = newQuestionsWithoutSolutions(questions);
    expect(result).toEqual(questions);
  });

  it('removes solution field from each question', async () => {
    const questions = {
      introduction: 'Hello',
      questions: [
        {
          'type': 'situational-judgement',
          'details': 'I am the first question',
          'options': [
            'I am the first option',
            'I am the second option',
            'I am the third option',
            'I am the fourth option',
          ],
          'mostAppropriate': 0,
          'leastAppropriate': 2,
        },
      ],
    };
    const questions_without_solutions = {
      introduction: 'Hello',
      questions: [
        {
          'type': 'situational-judgement',
          'details': 'I am the first question',
          'options': [
            'I am the first option',
            'I am the second option',
            'I am the third option',
            'I am the fourth option',
          ],
        },
      ],
    };
    const result = newQuestionsWithoutSolutions(questions);
    expect(result).toEqual(questions_without_solutions);
  });

  it('removes solution field from all questions', async () => {
    const questions = {
      questions: [
        {
          'type': 'situational-judgement',
          'mostAppropriate': 0,
          'leastAppropriate': 2,
        },
        {
          'type': 'situational-judgement',
          'mostAppropriate': 0,
          'leastAppropriate': 2,
        },
        {
          'type': 'situational-judgement',
          'mostAppropriate': 0,
          'leastAppropriate': 2,
        },
      ],
    };
    const questions_without_solutions = {
      questions: [
        {
          'type': 'situational-judgement',
        },
        {
          'type': 'situational-judgement',
        },
        {
          'type': 'situational-judgement',
        },
      ],
    };
    const result = newQuestionsWithoutSolutions(questions);
    expect(result).toEqual(questions_without_solutions);
  });

});

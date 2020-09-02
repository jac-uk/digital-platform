const config = require('../../../../nodeScripts/shared/config');
const newQuestionsWithScoredAnswers = require('../../../../functions/shared/factories/QualifyingTests/newQuestionsWithScoredAnswers')(config);

describe('newQuestionsWithScoredAnswers()', () => {
  describe('critical analysis test', () => {
    it('adds score to each question response', async () => {
      const qualifyingTest = {
        type: config.QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS,
        testQuestions: {
          questions: [
            {
              'correct': 0,
            },
            {
              'correct': 2,
            },
          ],
        },
      };
      const qualifyingTestResponse = {
        testQuestions: {
          questions: [
            {
              response: {
                selection: 1,
              },
            },
            {
              response: {
                selection: 2,
              },
            },
          ],
        },
      };
      const result = newQuestionsWithScoredAnswers(qualifyingTest, qualifyingTestResponse);
      expect(result).toEqual([
        {
          response: {
            selection: 1,
            score: 0,
          },
        },
        {
          response: {
            selection: 2,
            score: 1,
          },
        },
      ]);
    });
  });

  describe('situational judgement test', () => {
    it('adds score to each question response', async () => {
      const qualifyingTest = {
        type: config.QUALIFYING_TEST.TYPE.SITUATIONAL_JUDGEMENT,
        testQuestions: {
          questions: [
            {
              mostAppropriate: 0,
              leastAppropriate: 2,
            },
            {
              mostAppropriate: 1,
              leastAppropriate: 0,              
            },
            {
              mostAppropriate: 2,
              leastAppropriate: 1,
            },
          ],
        },
      };
      const qualifyingTestResponse = {
        testQuestions: {
          questions: [
            {
              response: {
                selection: {
                  mostAppropriate: 0,
                  leastAppropriate: 2,
                },
              },
            },
            {
              response: {
                selection: {
                  mostAppropriate: 0,
                  leastAppropriate: 1,
                },
              },
            },
            {
              response: {
                selection: {
                  mostAppropriate: 2,
                  leastAppropriate: 3,
                },
              },
            },
          ],
        },
      };
      const result = newQuestionsWithScoredAnswers(qualifyingTest, qualifyingTestResponse);
      expect(result).toEqual([
        {
          response: {
            selection: {
              mostAppropriate: 0,
              leastAppropriate: 2,
            },
            score: 2,
          },
        },
        {
          response: {
            selection: {
              mostAppropriate: 0,
              leastAppropriate: 1,
            },
            score: 0,
          },
        },
        {
          response: {
            selection: {
              mostAppropriate: 2,
              leastAppropriate: 3,
            },
            score: 1,
          },
        },
      ]);
    });
  });

  describe('scenario test', () => {
    it('does not make any changes (scenario tests are manually scored)', async () => {
      const qualifyingTest = {
        type: config.QUALIFYING_TEST.TYPE.SCENARIO,
        testQuestions: {
          questions: [
            {
              details: 'details 1',
              options: [
                { answer: 'q1 answer 1' },
                { answer: 'q2 answer 2' },
              ],
            },
            {
              details: 'details 1',
              options: [
                { answer: 'q1 answer 1' },
                { answer: 'q2 answer 2' },
              ],
            },
          ],
        },
      };
      const qualifyingTestResponse = {
        testQuestions: {
          questions: [
            {
              response: {
                answer: 'candidate answer 1',
              },
            },
            {
              response: {
                answer: 'candidate answer 2',
              },
            },
          ],
        },
      };
      const result = newQuestionsWithScoredAnswers(qualifyingTest, qualifyingTestResponse);
      expect(result).toEqual([
        {
          response: {
            answer: 'candidate answer 1',
          },
        },
        {
          response: {
            answer: 'candidate answer 2',
          },
        },
      ]);
    });
  });

});

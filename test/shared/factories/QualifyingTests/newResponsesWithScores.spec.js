const config = require('../../../../nodeScripts/shared/config');
const newResponsesWithScores = require('../../../../functions/shared/factories/QualifyingTests/newResponsesWithScores')(config);

describe('newResponsesWithScores()', () => {
  describe('critical analysis test', () => {
    it('adds score to each response', async () => {
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
            { },
            { },
          ],
        },
        responses: [
          {
            selection: 1,
          },
          {
            selection: 2,
          },
        ],
      };
      const result = newResponsesWithScores(qualifyingTest, qualifyingTestResponse);
      expect(result).toEqual([
        {
          selection: 1,
          score: 0,
        },
        {
          selection: 2,
          score: 1,
        },
      ]);
    });
    it('is backwards compatible with old data model (response stored alongside question))', async () => {
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
            { },
          ],
        },
        responses: [],
      };
      const result = newResponsesWithScores(qualifyingTest, qualifyingTestResponse);
      expect(result).toEqual([
        {
          selection: 1,
          score: 0,
        },
        {
          started: null,
          completed: null,
          selection: null,
          score: 0,
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
            {},
            {},
            {},
          ],
        },
        responses: [
          {
            selection: {
              mostAppropriate: 0,
              leastAppropriate: 2,
            },
          },
          {
            selection: {
              mostAppropriate: 2,
              leastAppropriate: 0,
            },
          },
          {
            selection: {
              mostAppropriate: 1,
              leastAppropriate: 2,
            },
          },
        ],
      };
      const result = newResponsesWithScores(qualifyingTest, qualifyingTestResponse);
      expect(result).toEqual([
        {
          selection: {
            mostAppropriate: 0,
            leastAppropriate: 2,
          },
          score: 2,
        },
        {
          selection: {
            mostAppropriate: 2,
            leastAppropriate: 0,
          },
          score: 1,
        },
        {
          selection: {
            mostAppropriate: 1,
            leastAppropriate: 2,
          },
          score: 0,
        },
      ]);
    });

    it('is backwards compatible with old data model (response stored alongside question))', async () => {
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
            { },
            {
              response: {
                selection: {
                  mostAppropriate: 1,
                  leastAppropriate: 2,
                },
              },
            },
          ],
        },
      };
      const result = newResponsesWithScores(qualifyingTest, qualifyingTestResponse);
      expect(result).toEqual([
        {
          selection: {
            mostAppropriate: 0,
            leastAppropriate: 2,
          },
          score: 2,
        },
        {
          started: null,
          completed: null,
          selection: {},
          score: 0,
        },
        {
          selection: {
            mostAppropriate: 1,
            leastAppropriate: 2,
          },
          score: 0,
        },
      ]);
    });
  });

  xdescribe('scenario test', () => {
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
      const result = newResponsesWithScores(qualifyingTest, qualifyingTestResponse);
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

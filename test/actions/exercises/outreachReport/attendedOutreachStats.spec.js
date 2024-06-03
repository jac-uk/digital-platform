const db = jest.fn();
const config = require('../../../../nodeScripts/shared/config');

const {
  attendedOutreachStats,
} = require('../../../../functions/actions/exercises/generateOutreachReport.js')(config, db);

const applications = [
  {
    equalityAndDiversitySurvey: {
      attendedOutreachEvents: true,
    },
  },
  {
    equalityAndDiversitySurvey: {
      attendedOutreachEvents: false,
    },
  },
  {
    equalityAndDiversitySurvey: {
      attendedOutreachEvents: 'prefer-not-to-say',
    },
  },
  {
    equalityAndDiversitySurvey: {
      attendedOutreachEvents: null, // Gets picked up as noAnswer
    },
  },
  {
    missingKey: {}, // Gets picked up as noAnswer
  },
];

// Expected Results
const results = {
  total: 5,
  yes: { total: 1, percent: ((1/2) * 100) },
  no: { total: 1, percent: ((1/2 * 100)) },
  preferNotToSay: { total: 1, percent: 0 },
  noAnswer: { total: 2, percent: 0 },
  declaration: { total: 2, percent: ((2/5) * 100) },
};

describe('attendedOutreachStats', () => {

  it('returns outreach stats', async () => {

    const resultData = attendedOutreachStats(applications);
    expect(resultData.total).toEqual(results.total);
    expect(resultData.yes.total).toEqual(results.yes.total);
    expect(resultData.yes.percent).toBeCloseTo(results.yes.percent);

    expect(resultData.no.total).toEqual(results.no.total);
    expect(resultData.no.percent).toBeCloseTo(results.no.percent);

    expect(resultData.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData.noAnswer.total).toEqual(results.noAnswer.total);
    
    expect(resultData.declaration.total).toEqual(results.declaration.total);
    expect(resultData.declaration.percent).toBeCloseTo(results.declaration.percent);
  });

});

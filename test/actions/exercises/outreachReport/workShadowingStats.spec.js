import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import initGenerateOutreachReport from '../../../../functions/actions/exercises/generateOutreachReport.js';

const db = jest.fn();

const {
  workshadowingStats,
} = initGenerateOutreachReport(firebase, db);

const applications = [
  {
    equalityAndDiversitySurvey: {
      participatedInJudicialWorkshadowingScheme: true,
    },
  },
  {
    equalityAndDiversitySurvey: {
      participatedInJudicialWorkshadowingScheme: false,
    },
  },
  {
    equalityAndDiversitySurvey: {
      participatedInJudicialWorkshadowingScheme: 'prefer-not-to-say',
    },
  },
  {
    equalityAndDiversitySurvey: {
      participatedInJudicialWorkshadowingScheme: null, // Gets picked up as noAnswer
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

describe('workshadowingStats', () => {

  it('returns outreach stats', async () => {

    const resultData = workshadowingStats(applications);
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

import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import config from '../../../../nodeScripts/shared/config.js';
import initGenerateOutreachReport from '../../../../functions/actions/exercises/generateOutreachReport.js';

const db = jest.fn();

const {
  hasTakenPAJEStats,
} = initGenerateOutreachReport(config, firebase, db);

const applications = [
  {
    equalityAndDiversitySurvey: {
      hasTakenPAJE: true,
    },
  },
  {
    equalityAndDiversitySurvey: {
      hasTakenPAJE: 'online-only',
    },
  },
  {
    equalityAndDiversitySurvey: {
      hasTakenPAJE: 'online-and-judge-led',
    },
  },
  {
    equalityAndDiversitySurvey: {
      hasTakenPAJE: false,
    },
  },
  {
    equalityAndDiversitySurvey: {
      hasTakenPAJE: 'no',
    },
  },
  {
    equalityAndDiversitySurvey: {
      hasTakenPAJE: null, // Gets picked up as noAnswer
    },
  },
  {
    missingKey: {}, // Gets picked up as noAnswer
  },
];

// Expected Results
const results = {
  total: 7,
  yes: { total: 1, percent: ((1/5) * 100) },
  no: { total: 2, percent: ((2/5 * 100)) },
  preferNotToSay: { total: 1, percent: 0 },
  noAnswer: { total: 2, percent: 0 },
  declaration: { total: 5, percent: ((5/7) * 100) },
};

describe('hasTakenPAJEStats', () => {

  it('returns outreach stats', async () => {

    const resultData = hasTakenPAJEStats(applications);
    expect(resultData.total).toEqual(results.total);
    expect(resultData.yes.total).toEqual(results.yes.total);
    expect(resultData.yes.percent).toBeCloseTo(results.yes.percent);

    expect(resultData.no.total).toEqual(results.no.total);
    expect(resultData.no.percent).toBeCloseTo(results.no.percent);

    expect(resultData.noAnswer.total).toEqual(results.noAnswer.total);
    
    expect(resultData.declaration.total).toEqual(results.declaration.total);
    expect(resultData.declaration.percent).toBeCloseTo(results.declaration.percent);
  });

});

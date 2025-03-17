import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  disabilityStats,
} = initGenerateDiversityReport(firebase, db);

// List of all possible ethnic groups
const disabilityGroups = ['prefer-not-to-say', true, false];

// Input data structure 1
const applications1 = disabilityGroups.map(element => {
  return {
    equalityAndDiversitySurvey: {
      disability: element,
    },
  };
});
applications1.push(
  {
    missingKey: {}, // Gets picked up as noAnswer
  }
);

// Input data structure 2
const applications2 = disabilityGroups.map(element => {
  return {
    disability: element,
  };
});
applications2.push(
  {
    missingKey: {}, // Gets picked up as noAnswer
  }
);

// Expected Results
const results = {
  total: 4,
  yes: { total: 1, percent: 50 },
  no: { total: 1, percent: 50 },
  preferNotToSay: { total: 1, percent: 0 },
  noAnswer: { total: 1, percent: 0 },
  declaration: { total: 2, percent: 50 },
};

describe('disabilityStats', () => {

  it('returns disability stats', async () => {

    const resultData1 = disabilityStats(applications1);
    expect(resultData1.total).toEqual(results.total);
    expect(resultData1.yes.total).toEqual(results.yes.total);
    expect(resultData1.yes.percent).toBeCloseTo(results.yes.percent);
    expect(resultData1.no.total).toEqual(results.no.total);
    expect(resultData1.no.percent).toBeCloseTo(results.no.percent);
    expect(resultData1.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData1.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData1.declaration.total).toEqual(results.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results.declaration.percent);

    const resultData2 = disabilityStats(applications2);
    expect(resultData2.total).toEqual(results.total);
    expect(resultData2.yes.total).toEqual(results.yes.total);
    expect(resultData2.yes.percent).toBeCloseTo(results.yes.percent);
    expect(resultData2.no.total).toEqual(results.no.total);
    expect(resultData2.no.percent).toBeCloseTo(results.no.percent);
    expect(resultData2.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData2.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData2.declaration.total).toEqual(results.declaration.total);
    expect(resultData2.declaration.percent).toBeCloseTo(results.declaration.percent);
  });

});

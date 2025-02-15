import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
//import config from '../../../../nodeScripts/shared/config.js';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  ethnicityStats,
} = initGenerateDiversityReport(firebase, db);

// List of all possible ethnic groups
const ethnicGroups = ['prefer-not-to-say', 'other-white', 'uk-ethnic', 'irish', 'gypsy-irish-traveller', 'other-ethnic-group', 'chinese', 'bangladeshi', 'indian', 'pakistani', 'other-asian', 'african', 'caribbean', 'other-black', 'white-black-caribbean', 'white-black-african', 'white-asian', 'other-mixed'];

// Input data structure 1
const applications1 = ethnicGroups.map(element => {
  return {
    equalityAndDiversitySurvey: {
      ethnicGroup: element,
    },
  };
});
applications1.push(
  {
    missingKey: {}, // Gets picked up as noAnswer
  }
);

// Input data structure 2
const applications2 = ethnicGroups.map(element => {
  return {
    ethnicGroup: element,
  };
});
applications2.push(
  {
    missingKey: {}, // Gets picked up as noAnswer
  }
);

// Expected Results
const results = {
  total: 19,
  white: { total: 4, percent: ((4/17) * 100) },
  bame: { total: 13, percent: ((13/17) * 100) },
  preferNotToSay: { total: 1, percent: 0 },
  noAnswer: { total: 1, percent: 0 },
  declaration: { total: 17, percent: ((17/19) * 100) },
};

describe('ethnicityStats', () => {

  it('returns ethnicity stats', async () => {

    const resultData1 = ethnicityStats(applications1);
    expect(resultData1.total).toEqual(results.total);
    expect(resultData1.white.total).toEqual(results.white.total);
    expect(resultData1.white.percent).toBeCloseTo(results.white.percent);
    expect(resultData1.bame.total).toEqual(results.bame.total);
    expect(resultData1.bame.percent).toBeCloseTo(results.bame.percent);
    expect(resultData1.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData1.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData1.declaration.total).toEqual(results.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results.declaration.percent);

    const resultData2 = ethnicityStats(applications2);
    expect(resultData2.total).toEqual(results.total);
    expect(resultData2.white.total).toEqual(results.white.total);
    expect(resultData2.white.percent).toBeCloseTo(results.white.percent);
    expect(resultData2.bame.total).toEqual(results.bame.total);
    expect(resultData2.bame.percent).toBeCloseTo(results.bame.percent);
    expect(resultData2.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData2.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData2.declaration.total).toEqual(results.declaration.total);
    expect(resultData2.declaration.percent).toBeCloseTo(results.declaration.percent);
  });

});

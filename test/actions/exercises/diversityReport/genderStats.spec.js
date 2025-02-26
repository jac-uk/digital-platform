import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  genderStats,
} = initGenerateDiversityReport(firebase, db);

// List of all possible gender groups
const genderGroups = ['prefer-not-to-say', 'no-answer', 'male', 'female', 'gender-neutral', 'other-gender'];

// Input data structure 1
const applications1 = genderGroups.map(element => {
  return {
    equalityAndDiversitySurvey: {
      gender: element,
    },
  };
});

// Input data structure 2
const applications2 = genderGroups.map(element => {
  return {
    gender: element,
  };
});

// Expected Results
const results = {
  total: 6,
  male: { total: 1, percent: 50 },
  female: { total: 1, percent: 50 },
  preferNotToSay: { total: 1, percent: 0 },
  other: { total: 2, percent: 0 },
  noAnswer: { total: 1, percent: 0 },
  declaration: { total: 2, percent: ((1/3) * 100) },
};

describe('genderStats', () => {

  it('returns gender stats', async () => {

    const resultData1 = genderStats(applications1);
    expect(resultData1.total).toEqual(results.total);
    expect(resultData1.male.total).toEqual(results.male.total);
    expect(resultData1.male.percent).toBeCloseTo(results.male.percent);
    expect(resultData1.female.total).toEqual(results.female.total);
    expect(resultData1.female.percent).toBeCloseTo(results.female.percent);
    expect(resultData1.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData1.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData1.declaration.total).toEqual(results.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results.declaration.percent);

    const resultData2 = genderStats(applications2);
    expect(resultData2.total).toEqual(results.total);
    expect(resultData2.male.total).toEqual(results.male.total);
    expect(resultData2.male.percent).toBeCloseTo(results.male.percent);
    expect(resultData2.female.total).toEqual(results.female.total);
    expect(resultData2.female.percent).toBeCloseTo(results.female.percent);
    expect(resultData2.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData2.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData2.declaration.total).toEqual(results.declaration.total);
    expect(resultData2.declaration.percent).toBeCloseTo(results.declaration.percent);
  });

});

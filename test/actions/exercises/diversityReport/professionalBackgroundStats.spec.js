import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  professionalBackgroundStats,
} = initGenerateDiversityReport(firebase, db);

const applications1 = [
  {
    equalityAndDiversitySurvey: {
      professionalBackground: 'prefer-not-to-say',
    },
  },
  {
    missingKey: {}, // Gets picked up as noAnswer
  },
  {
    equalityAndDiversitySurvey: {
      professionalBackground: 'other-professional-background',
    },
  },
  {
    equalityAndDiversitySurvey: {
      professionalBackground: 'solicitor',
    },
  },
  {
    equalityAndDiversitySurvey: {
      professionalBackground: 'cilex',
    },
  },
  {
    equalityAndDiversitySurvey: {
      professionalBackground: 'barrister',
    },
  },
  {
    equalityAndDiversitySurvey: {
      professionalBackground: ['barrister', 'other-professional-background'],
    },
  },
];

const applications2 = [
  {
    professionalBackground: 'prefer-not-to-say',
  },
  {
    missingKey: {}, // Gets picked up as noAnswer
  },
  {
    professionalBackground: 'other-professional-background',
  },
  {
    professionalBackground: 'solicitor',
  },
  {
    professionalBackground: 'cilex',
  },
  {
    professionalBackground: 'barrister',
  },
  {
    professionalBackground: ['barrister', 'other-professional-background'],
  },
];

// Expected Results
const results = {
  total: 7,
  barrister: { total: 2, percent: 40 },
  cilex: { total: 1, percent: 20 },
  solicitor: { total: 1, percent: 20 },
  other:  { total: 2, percent: 0 },
  preferNotToSay: { total: 1, percent: 0 },
  noAnswer: { total: 1, percent: 0 },
  declaration: { total: 5, percent: ((5/7) * 100) },
};

describe('professionalBackgroundStats', () => {

  it('returns professional background stats', async () => {

    const resultData1 = professionalBackgroundStats(applications1);
    expect(resultData1.total).toEqual(results.total);
    expect(resultData1.barrister.total).toEqual(results.barrister.total);
    expect(resultData1.barrister.percent).toBeCloseTo(results.barrister.percent);
    expect(resultData1.cilex.total).toEqual(results.cilex.total);
    expect(resultData1.cilex.percent).toBeCloseTo(results.cilex.percent);
    expect(resultData1.solicitor.total).toEqual(results.solicitor.total);
    expect(resultData1.solicitor.percent).toBeCloseTo(results.solicitor.percent);
    expect(resultData1.other.total).toEqual(results.other.total);
    expect(resultData1.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData1.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData1.declaration.total).toEqual(results.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results.declaration.percent);

    const resultData2 = professionalBackgroundStats(applications2);
    expect(resultData2.total).toEqual(results.total);
    expect(resultData2.barrister.total).toEqual(results.barrister.total);
    expect(resultData2.barrister.percent).toBeCloseTo(results.barrister.percent);
    expect(resultData2.cilex.total).toEqual(results.cilex.total);
    expect(resultData2.cilex.percent).toBeCloseTo(results.cilex.percent);
    expect(resultData2.solicitor.total).toEqual(results.solicitor.total);
    expect(resultData2.solicitor.percent).toBeCloseTo(results.solicitor.percent);
    expect(resultData1.other.total).toEqual(results.other.total);
    expect(resultData2.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData2.noAnswer.total).toEqual(results.noAnswer.total);
    expect(resultData2.declaration.total).toEqual(results.declaration.total);
    expect(resultData2.declaration.percent).toBeCloseTo(results.declaration.percent);
  });

});

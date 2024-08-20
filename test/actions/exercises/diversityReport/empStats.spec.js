import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import config from '../../../../nodeScripts/shared/config.js';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  empStats,
} = initGenerateDiversityReport(config, firebase, db);

// List of all possible emp groups
const empGroups = [true, false, 'gender', 'ethnicity'];

// Input data structure
const applicationsRecords = empGroups.map(element => {
  return {
    flags: {
      empApplied: element,
    },
  };
});

// Expected Results
const results = {
  applied: { total: 1, percent: 25 },
  gender: { total: 1, percent: 25 },
  ethnicity: { total: 1, percent: 25 },
  noAnswer: { total: 1, percent: 0 },
  total: 4,
};

describe('empStats', () => {

  it('returns emp stats', async () => {

    const resultData1 = empStats(applicationsRecords);
    expect(resultData1.total).toEqual(results.total);
    expect(resultData1.applied.total).toEqual(results.applied.total);
    expect(resultData1.applied.percent).toBeCloseTo(results.applied.percent);
    expect(resultData1.gender.total).toEqual(results.gender.total);
    expect(resultData1.gender.percent).toBeCloseTo(results.gender.percent);
    expect(resultData1.ethnicity.total).toEqual(results.ethnicity.total);
    expect(resultData1.ethnicity.percent).toEqual(results.ethnicity.percent);
    expect(resultData1.noAnswer.total).toEqual(results.noAnswer.total);
  });

});

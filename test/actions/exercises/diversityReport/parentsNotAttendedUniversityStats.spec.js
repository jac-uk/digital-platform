import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  parentsNotAttendedUniversityStats,
} = initGenerateDiversityReport(firebase, db);

describe('parentsNotAttendedUniversityStats', () => {

  // Post 01-04-2023 fields
  const applications1 = [
    {
      equalityAndDiversitySurvey: {
        parentsAttendedUniversity: true,
      },
    },
    {
      equalityAndDiversitySurvey: {
        parentsAttendedUniversity: false,
      },
    },
    {
      equalityAndDiversitySurvey: {
        parentsAttendedUniversity: 'do-not-know',
      },
    },
    {
      equalityAndDiversitySurvey: {
        parentsAttendedUniversity: 'prefer-not-to-say',
      },
    },
    {
      equalityAndDiversitySurvey: {
        parentsAttendedUniversity: 'prefer-not-to-say',
      },
    },
    {
      equalityAndDiversitySurvey: {
        parentsAttendedUniversity: false,
      },
    },
    {
      equalityAndDiversitySurvey: {
        parentsAttendedUniversity: true,
      },
    },
  ];

  const exercise = {
    applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-04-02')),
  };

  it('returns parents did not attend University stats post-01-04-2023', async () => {

    // Expected Results
    const results1 = {
      parentsNotAttendedUniversity: { total: 2, percent: ((2/5) * 100) },
      declaration: { total: 5, percent: ((5/7) * 100) },
      total: 7,
    };

    const resultData1 = parentsNotAttendedUniversityStats(applications1, exercise);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);
    expect(resultData1.parentsNotAttendedUniversity.total).toEqual(results1.parentsNotAttendedUniversity.total);
    expect(resultData1.parentsNotAttendedUniversity.percent).toBeCloseTo(results1.parentsNotAttendedUniversity.percent);
  });

  it('returns correct if empty post-01-04-2023', async () => {

    applications1.push(
      {
        equalityAndDiversitySurvey: {
          parentsAttendedUniversity: null,
        },
      },
      {
        equalityAndDiversitySurvey: {
          parentsAttendedUniversity: '',
        },
      },
      {
        parentsAttendedUniversity: {},
      }
    );

    // Expected Results
    const results1 = {
      parentsNotAttendedUniversity: { total: 2, percent: ((2/8) * 100) },
      declaration: { total: 8, percent: ((8/10) * 100) },
      total: 10,
    };

    const resultData1 = parentsNotAttendedUniversityStats(applications1, exercise);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);
    expect(resultData1.parentsNotAttendedUniversity.total).toEqual(results1.parentsNotAttendedUniversity.total);
    expect(resultData1.parentsNotAttendedUniversity.percent).toBeCloseTo(results1.parentsNotAttendedUniversity.percent);
  });

});

import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
//import config from '../../../../nodeScripts/shared/config.js';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  firstGenerationUniversityStats,
} = initGenerateDiversityReport(firebase, db);

describe('firstGenerationUniversityStats', () => {

  // Pre 01-04-2023 fields
  const applications1 = [
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: true,
      },
    },
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: false,
      },
    },
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: 'do-not-know',
      },
    },
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: 'prefer-not-to-say',
      },
    },
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: 'prefer-not-to-say',
      },
    },
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: false,
      },
    },
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: true,
      },
    },
    {
      equalityAndDiversitySurvey: {
        firstGenerationStudent: true,
      },
    },
  ];

  const exercise = {
    applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-03-31')),
  };

  it('returns candidate is first generation to attend University stats pre-01-04-2023', async () => {

    // Expected Results
    const results1 = {
      firstGenerationUniversity: { total: 3, percent: ((3/6) * 100) },
      declaration: { total: 6, percent: ((6/8) * 100) },
      total: 8,
    };

    const resultData1 = firstGenerationUniversityStats(applications1, exercise);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);
    expect(resultData1.firstGenerationUniversity.total).toEqual(results1.firstGenerationUniversity.total);
    expect(resultData1.firstGenerationUniversity.percent).toBeCloseTo(results1.firstGenerationUniversity.percent);
  });

  it('returns correct stats if empty firstGenerationStudent', async () => {
    
    applications1.push(
      {
        equalityAndDiversitySurvey: {
          firstGenerationStudent: null,
        },
      },
      {
        equalityAndDiversitySurvey: {
          firstGenerationStudent: '',
        },
      },
      {
        equalityAndDiversitySurvey: {},
      }
    );

    // Expected Results
    const results1 = {
      firstGenerationUniversity: { total: 3, percent: ((3/8) * 100) },
      declaration: { total: 8, percent: ((8/11) * 100) },
      total: 11,
    };

    const resultData1 = firstGenerationUniversityStats(applications1, exercise);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);
    expect(resultData1.firstGenerationUniversity.total).toEqual(results1.firstGenerationUniversity.total);
    expect(resultData1.firstGenerationUniversity.percent).toBeCloseTo(results1.firstGenerationUniversity.percent);
  });

});

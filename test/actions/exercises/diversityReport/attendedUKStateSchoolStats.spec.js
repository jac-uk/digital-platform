import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
//import config from '../../../../nodeScripts/shared/config.js';
import initGenerateDiversityReport from '../../../../functions/actions/exercises/generateDiversityReport.js';

const db = jest.fn();

const {
  attendedUKStateSchoolStats,
} = initGenerateDiversityReport(firebase, db);

describe('attendedUKStateSchoolStats', () => {

  // Pre 01-04-2023 fields
  const applicationsPre = [
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool: 'prefer-not-to-say',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool: 'do-not-know',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool: 'non-uk-educated',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool: 'uk-independent-fee-with-bursary',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool: 'uk-independent-fee',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool: 'uk-state-selective',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool: 'uk-state-non-selective',
      },
    },
  ];

  const exercisePre = {
    applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-03-31')),
  };

  // Post 01-04-2023 fields
  const applicationsPost = [
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool16: 'prefer-not-to-say',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool16: 'do-not-know',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool16: 'non-uk-educated',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool16: 'uk-independent-fee-with-bursary',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool16: 'uk-independent-fee',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool16: 'uk-state-selective',
      },
    },
    {
      equalityAndDiversitySurvey: {
        stateOrFeeSchool16: 'uk-state-non-selective',
      },
    },
  ];

  const exercisePost = {
    applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-04-02')),
  };

  it('returns attended UK StateSchool stats pre-01-04-2023', async () => {

    // Expected Results
    const results1 = {
      attendedUKStateSchool: { total: 2, percent: ((2/6) * 100) },
      declaration: { total: 6, percent: ((6/7) * 100) },
      total: 7,
    };

    const resultData1 = attendedUKStateSchoolStats(applicationsPre, exercisePre);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);

    expect(resultData1.attendedUKStateSchool.total).toEqual(results1.attendedUKStateSchool.total);
    expect(resultData1.attendedUKStateSchool.percent).toBeCloseTo(results1.attendedUKStateSchool.percent);
  });

  it('returns correct if empty for pre-01-04-2023', async () => {

    applicationsPre.push(
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: null,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: '',
        },
      },
      {
        stateOrFeeSchool: {},
      }
    );

    // Expected Results
    const results1 = {
      attendedUKStateSchool: { total: 2, percent: ((2/9) * 100) },
      declaration: { total: 9, percent: ((9/10) * 100) },
      total: 10,
    };

    const resultData1 = attendedUKStateSchoolStats(applicationsPre, exercisePre);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);

    expect(resultData1.attendedUKStateSchool.total).toEqual(results1.attendedUKStateSchool.total);
    expect(resultData1.attendedUKStateSchool.percent).toBeCloseTo(results1.attendedUKStateSchool.percent);
  });

  it('returns attended UK StateSchool stats post-01-04-2023', async () => {

    // Expected Results
    const results1 = {
      attendedUKStateSchool: { total: 2, percent: ((2/6) * 100) },
      declaration: { total: 6, percent: ((6/7) * 100) },
      total: 7,
    };

    const resultData1 = attendedUKStateSchoolStats(applicationsPost, exercisePost);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);
    expect(resultData1.attendedUKStateSchool.total).toEqual(results1.attendedUKStateSchool.total);
    expect(resultData1.attendedUKStateSchool.percent).toBeCloseTo(results1.attendedUKStateSchool.percent);
  });

  it('returns correct if empty for post-01-04-2023', async () => {

    applicationsPost.push(
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: null,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: '',
        },
      },
      {
        stateOrFeeSchool16: {},
      }
    );

    // Expected Results
    const results1 = {
      attendedUKStateSchool: { total: 2, percent: ((2/9) * 100) },
      declaration: { total: 9, percent: ((9/10) * 100) },
      total: 10,
    };

    const resultData1 = attendedUKStateSchoolStats(applicationsPost, exercisePost);

    expect(resultData1.total).toEqual(results1.total);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);
    expect(resultData1.declaration.percent).toBeCloseTo(results1.declaration.percent);

    expect(resultData1.attendedUKStateSchool.total).toEqual(results1.attendedUKStateSchool.total);
    expect(resultData1.attendedUKStateSchool.percent).toBeCloseTo(results1.attendedUKStateSchool.percent);
  });

});

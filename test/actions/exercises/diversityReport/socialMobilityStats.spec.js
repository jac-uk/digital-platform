const firebase = require('firebase-admin');
const db = jest.fn();

const {
  socialMobilityStats,
} = require('../../../../functions/actions/exercises/generateDiversityReport.js')(firebase, db);

describe('socialMobilityStats', () => {

  it('returns social mobility stats pre-01-04-2023', async () => {

    // Pre 01-04-2023 fields
    const applications1 = [
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: 'prefer-not-to-say',
          firstGenerationStudent: true,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: 'do-not-know',
          firstGenerationStudent: false,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: 'non-uk-educated',
          firstGenerationStudent: true,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: 'uk-independent-fee-with-bursary',
          firstGenerationStudent: false,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: 'uk-independent-fee',
          firstGenerationStudent: true,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: 'uk-state-selective',
          firstGenerationStudent: false,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool: 'uk-state-non-selective',
          firstGenerationStudent: true,
        },
      },
    ];

    const applications2 = [
      {
        stateOrFeeSchool: 'prefer-not-to-say',
        firstGenerationStudent: true,
      },
      {
        stateOrFeeSchool: 'do-not-know',
        firstGenerationStudent: false,
      },
      {
        stateOrFeeSchool: 'non-uk-educated',
        firstGenerationStudent: true,
      },
      {
        stateOrFeeSchool: 'uk-independent-fee-with-bursary',
        firstGenerationStudent: false,
      },
      {
        stateOrFeeSchool: 'uk-independent-fee',
        firstGenerationStudent: true,
      },
      {
        stateOrFeeSchool: 'uk-state-selective',
        firstGenerationStudent: false,
      },
      {
        stateOrFeeSchool: 'uk-state-non-selective',
        firstGenerationStudent: true,
      },
    ];

    const exercise = {
      applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-03-31')),
    };

    // Expected Results
    const results1 = {
      attendedUKStateSchool: { total: 2, percent: ((2/7) * 100) },
      firstGenerationUniversity: { total: 4, percent: ((4/7) * 100) },
      declaration: { total: 7 },
    };

    const resultData1 = socialMobilityStats(applications1, exercise);
    expect(resultData1.attendedUKStateSchool.total).toEqual(results1.attendedUKStateSchool.total);
    expect(resultData1.attendedUKStateSchool.percent).toBeCloseTo(results1.attendedUKStateSchool.percent);
    expect(resultData1.firstGenerationUniversity.total).toEqual(results1.firstGenerationUniversity.total);
    expect(resultData1.firstGenerationUniversity.percent).toBeCloseTo(results1.firstGenerationUniversity.percent);
    expect(resultData1.declaration.total).toEqual(results1.declaration.total);

    const resultData2 = socialMobilityStats(applications2, exercise);
    expect(resultData2.attendedUKStateSchool.total).toEqual(results1.attendedUKStateSchool.total);
    expect(resultData2.attendedUKStateSchool.percent).toBeCloseTo(results1.attendedUKStateSchool.percent);
    expect(resultData2.firstGenerationUniversity.total).toEqual(results1.firstGenerationUniversity.total);
    expect(resultData2.firstGenerationUniversity.percent).toBeCloseTo(results1.firstGenerationUniversity.percent);
    expect(resultData2.declaration.total).toEqual(results1.declaration.total);
  });

  it('returns social mobility stats post-01-04-2023', async () => {

    // Post 01-04-2023 fields
    const applications3 = [
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: 'prefer-not-to-say',
          parentsAttendedUniversity: true,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: 'do-not-know',
          parentsAttendedUniversity: false,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: 'non-uk-educated',
          parentsAttendedUniversity: true,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: 'uk-independent-fee-with-bursary',
          parentsAttendedUniversity: false,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: 'uk-independent-fee',
          parentsAttendedUniversity: true,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: 'uk-state-selective',
          parentsAttendedUniversity: false,
        },
      },
      {
        equalityAndDiversitySurvey: {
          stateOrFeeSchool16: 'uk-state-non-selective',
          parentsAttendedUniversity: true,
        },
      },
    ];

    const applications4 = [
      {
        stateOrFeeSchool16: 'prefer-not-to-say',
        parentsAttendedUniversity: true,
      },
      {
        stateOrFeeSchool16: 'do-not-know',
        parentsAttendedUniversity: false,
      },
      {
        stateOrFeeSchool16: 'non-uk-educated',
        parentsAttendedUniversity: true,
      },
      {
        stateOrFeeSchool16: 'uk-independent-fee-with-bursary',
        parentsAttendedUniversity: false,
      },
      {
        stateOrFeeSchool16: 'uk-independent-fee',
        parentsAttendedUniversity: true,
      },
      {
        stateOrFeeSchool16: 'uk-state-selective',
        parentsAttendedUniversity: false,
      },
      {
        stateOrFeeSchool16: 'uk-state-non-selective',
        parentsAttendedUniversity: true,
      },
    ];

    const exercise = {
      applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-04-31')),
    };

    const results2 = {
      attendedUKStateSchool: { total: 2, percent: ((2/7) * 100) },
      parentsAttendedUniversity: { total: 4, percent: ((4/7) * 100) },
      declaration: { total: 7 },
    };

    const resultData3 = socialMobilityStats(applications3, exercise);
    expect(resultData3.attendedUKStateSchool.total).toEqual(results2.attendedUKStateSchool.total);
    expect(resultData3.attendedUKStateSchool.percent).toBeCloseTo(results2.attendedUKStateSchool.percent);
    expect(resultData3.parentsAttendedUniversity.total).toEqual(results2.parentsAttendedUniversity.total);
    expect(resultData3.parentsAttendedUniversity.percent).toBeCloseTo(results2.parentsAttendedUniversity.percent);
    expect(resultData3.declaration.total).toEqual(results2.declaration.total);

    const resultData4 = socialMobilityStats(applications4, exercise);
    expect(resultData4.attendedUKStateSchool.total).toEqual(results2.attendedUKStateSchool.total);
    expect(resultData4.attendedUKStateSchool.percent).toBeCloseTo(results2.attendedUKStateSchool.percent);
    expect(resultData4.parentsAttendedUniversity.total).toEqual(results2.parentsAttendedUniversity.total);
    expect(resultData4.parentsAttendedUniversity.percent).toBeCloseTo(results2.parentsAttendedUniversity.percent);
    expect(resultData4.declaration.total).toEqual(results2.declaration.total);
  });

});

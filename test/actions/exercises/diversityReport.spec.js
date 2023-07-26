const firebase = require('firebase-admin');
const db = jest.fn();

const {
  genderStats,
  ethnicityStats,
  disabilityStats,
  professionalBackgroundStats,
  socialMobilityStats,
  empStats,
} = require('../../../functions/actions/exercises/generateDiversityReport.js')(firebase, db);

describe('genderStats', () => {

  // GENDER STATS
  it('returns gender stats', async () => {

    const applications1 = [
      {
        equalityAndDiversitySurvey: {
          gender: 'prefer-not-to-say',
        },
      },
      {
        equalityAndDiversitySurvey: {
          gender: 'no-answer',  // Gets picked up as noAnswer even though it's not actually a selection
        },
      },
      {
        equalityAndDiversitySurvey: {
          gender: 'male',
        },
      },
      {
        equalityAndDiversitySurvey: {
          gender: 'female',
        },
      },
      {
        equalityAndDiversitySurvey: {
          gender: 'gender-neutral',
        },
      },
      {
        equalityAndDiversitySurvey: {
          gender: 'other-gender',
        },
      },
    ];

    const applications2 = [
      {
        gender: 'prefer-not-to-say',
      },
      {
        gender: 'no-answer',  // Gets picked up as noAnswer even though it's not actually a selection
      },
      {
        gender: 'male',
      },
      {
        gender: 'female',
      },
      {
        gender: 'gender-neutral',
      },
      {
        gender: 'other-gender',
      },
    ];

    const results = {
      total: 2,
      male: { total: 1, percent: 50 },
      female: { total: 1, percent: 50 },
      preferNotToSay: { total: 1, percent: 0 },
      other: { total: 2, percent: 0 },
      noAnswer: { total: 1, percent: 0 },
      declaration: { total: 6, percent: ((1/3) * 100) },
    };

    const resultData1 = genderStats(applications1);
    expect(resultData1).toEqual(results);

    const resultData2 = genderStats(applications2);
    expect(resultData2).toEqual(results);
  });


  // ETHNICITY STATS
  it('returns ethnicity stats', async () => {

    const applications1 = [
      {
        equalityAndDiversitySurvey: {
          ethnicGroup: 'prefer-not-to-say',
        },
      },
      {
        missingKey: {}, // Gets picked up as noAnswer
      },
      {
        equalityAndDiversitySurvey: {
          ethnicGroup: 'other-ethnic-group',
        },
      },
      {
        equalityAndDiversitySurvey: {
          ethnicGroup: 'other-white',
        },
      },
      {
        equalityAndDiversitySurvey: {
          ethnicGroup: 'uk-ethnic',
        },
      },
      {
        equalityAndDiversitySurvey: {
          ethnicGroup: 'irish',
        },
      },
      {
        equalityAndDiversitySurvey: {
          ethnicGroup: 'gypsy-irish-traveller',
        },
      },
    ];

    const applications2 = [
      {
        ethnicGroup: 'prefer-not-to-say',
      },
      {
        missingKey: {}, // Gets picked up as noAnswer
      },
      {
        ethnicGroup: 'other-ethnic-group',
      },
      {
        ethnicGroup: 'other-white',
      },
      {
        ethnicGroup: 'uk-ethnic',
      },
      {
        ethnicGroup: 'irish',
      },
      {
        ethnicGroup: 'gypsy-irish-traveller',
      },
    ];

    const results = {
      total: 5,
      white: { total: 4, percent: 80 },
      bame: { total: 1, percent: 20 },
      preferNotToSay: { total: 1, percent: 0 },
      noAnswer: { total: 1, percent: 0 },
      declaration: { total: 7, percent: ((5/7) * 100) },
    };

    const resultData1 = ethnicityStats(applications1);
    expect(resultData1).toEqual(results);

    const resultData2 = ethnicityStats(applications2);
    expect(resultData2).toEqual(results);
  });


  // DISABILITY STATS
  it('returns disability stats', async () => {
    const applications1 = [
      {
        equalityAndDiversitySurvey: {
          disability: 'prefer-not-to-say',
        },
      },
      {
        missingKey: {}, // Gets picked up as noAnswer
      },
      {
        equalityAndDiversitySurvey: {
          disability: true,
        },
      },
      {
        equalityAndDiversitySurvey: {
          disability: false,
        },
      },
    ];

    const applications2 = [
      {
        disability: 'prefer-not-to-say',
      },
      {
        missingKey: {}, // Gets picked up as noAnswer
      },
      {
        disability: true,
      },
      {
        disability: false,
      },
    ];

    const results = {
      total: 2,
      yes: { total: 1, percent: 50 },
      no: { total: 1, percent: 50 },
      preferNotToSay: { total: 1, percent: 0 },
      noAnswer: { total: 1, percent: 0 },
      declaration: { total: 4, percent: 50 },
    };

    const resultData1 = disabilityStats(applications1);
    expect(resultData1).toEqual(results);

    const resultData2 = disabilityStats(applications2);
    expect(resultData2).toEqual(results);
  });


  // PROFESSIONAL BACKGROUND STATS
  it('returns professional background stats', async () => {

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

    const results = {
      total: 4,
      barrister: { total: 2, percent: 50 },
      cilex: { total: 1, percent: 25 },
      solicitor: { total: 1, percent: 25 },
      other:  { total: 2, percent: 0 },
      preferNotToSay: { total: 1, percent: 0 },
      noAnswer: { total: 1, percent: 0 },
      declaration: { total: 7, percent: ((4/7) * 100) },
    };

    const resultData1 = professionalBackgroundStats(applications1);
    expect(resultData1).toEqual(results);

    const resultData2 = professionalBackgroundStats(applications2);
    expect(resultData2).toEqual(results);
  });


  // SOCIAL MOBILITY STATS (PRE 01-04-2023)
  it('returns social mobility stats pre-01-04-2023', async () => {

    const exercise = {
      applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-03-31')),
    };
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

    const results = {
      attendedUKStateSchool: { total: 2, percent: ((2/7) * 100) },
      firstGenerationUniversity: { total: 4, percent: ((4/7) * 100) },
      declaration: { total: 7 },
    };

    const resultData1 = socialMobilityStats(applications1, exercise);
    expect(resultData1).toEqual(results);

    const resultData2 = socialMobilityStats(applications2, exercise);
    expect(resultData2).toEqual(results);
  });


  // SOCIAL MOBILITY STATS (POST 01-04-2023)
  it('returns social mobility stats post-01-04-2023', async () => {
    const exercise = {
      applicationOpenDate: firebase.firestore.Timestamp.fromDate(new Date('2023-04-31')),
    };
    const applications1 = [
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

    const applications2 = [
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

    const results = {
      attendedUKStateSchool: { total: 2, percent: ((2/7) * 100) },
      parentsAttendedUniversity: { total: 4, percent: ((4/7) * 100) },
      declaration: { total: 7 },
    };

    const resultData1 = socialMobilityStats(applications1, exercise);
    expect(resultData1).toEqual(results);

    const resultData2 = socialMobilityStats(applications2, exercise);
    expect(resultData2).toEqual(results);
  });


  // EMP STATS
  it('returns EMP stats', async () => {
    const applicationRecords = [
      {
        flags: {
          empApplied: false,  // => No Answer
        },
      },
      {
        flags: {
          empApplied: true, // => 'applied'
        },
      },
      {
        flags: {
          empApplied: 'gender',
        },
      },
      {
        flags: {
          empApplied: 'ethnicity',
        },
      },
    ];
    const results = {
      applied: { total: 1, percent: 25 },
      gender: { total: 1, percent: 25 },
      ethnicity: { total: 1, percent: 25 },
      noAnswer: { total: 1, percent: 0 },
      declaration: { total: 4 },
    };
    const resultData = empStats(applicationRecords);
    expect(resultData).toEqual(results);
  });

});

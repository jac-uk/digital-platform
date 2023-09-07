const firebase = require('firebase-admin');
const { applicationOpenDatePost01042023 } = require('../../../functions/shared/converters/helpers');

const pre010423Date = firebase.firestore.Timestamp.fromDate(new Date('2023-03-31'));
const on010423Date = firebase.firestore.Timestamp.fromDate(new Date('2023-04-01'));
const post010423Date = firebase.firestore.Timestamp.fromDate(new Date('2023-04-02'));

describe('applicationOpenDatePost01042023()', () => {

  it('returns false when application open date pre 01/04/2023', async () => {
    const exercise = {
      applicationOpenDate: pre010423Date,
      referenceNumber: 'ABC',
    };

    const result = applicationOpenDatePost01042023(exercise);
    expect(result).toBe(false);
  });

  it('returns false when application open date on 01/04/2023', async () => {
    const exercise = {
      applicationOpenDate: on010423Date,
      referenceNumber: 'ABC',
    };

    const result = applicationOpenDatePost01042023(exercise);
    expect(result).toBe(false);
  });

  it('returns true when application open date post 01/04/2023', async () => {
    const exercise = {
      applicationOpenDate: post010423Date,
      referenceNumber: 'ABC',
    };

    const result = applicationOpenDatePost01042023(exercise);
    expect(result).toBe(true);
  });

  it('returns false when application refNumber matches one of the exemptions', async () => {
    const exercise = {
      applicationOpenDate: post010423Date,
      referenceNumber: 'JAC00130',
    };

    const result = applicationOpenDatePost01042023(exercise);
    expect(result).toBe(false);
  });
});



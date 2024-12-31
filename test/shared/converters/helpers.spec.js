import { applicationOpenDatePost01042023, ordinal } from '../../../functions/shared/converters/helpers.js';
import { Timestamp } from 'firebase-admin/firestore';

const pre010423Date = Timestamp.fromDate(new Date('2023-03-31'));
const on010423Date = Timestamp.fromDate(new Date('2023-04-01'));
const post010423Date = Timestamp.fromDate(new Date('2023-04-02'));

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

describe('ordinal()', () => {

  it('should return the input number with "st" suffix when the number ends with 1 except for numbers ending with 11', () => {
    expect(ordinal(1)).toBe('1st');
    expect(ordinal(21)).toBe('21st');
    expect(ordinal(31)).toBe('31st');
    expect(ordinal(41)).toBe('41st');
    expect(ordinal(51)).toBe('51st');
    expect(ordinal(61)).toBe('61st');
    expect(ordinal(71)).toBe('71st');
    expect(ordinal(81)).toBe('81st');
    expect(ordinal(91)).toBe('91st');
  });

  it('should return the input number with "nd" suffix when the number ends with 2 except for numbers ending with 12', () => {
    expect(ordinal(2)).toBe('2nd');
    expect(ordinal(22)).toBe('22nd');
    expect(ordinal(32)).toBe('32nd');
    expect(ordinal(42)).toBe('42nd');
    expect(ordinal(52)).toBe('52nd');
    expect(ordinal(62)).toBe('62nd');
    expect(ordinal(72)).toBe('72nd');
    expect(ordinal(82)).toBe('82nd');
    expect(ordinal(92)).toBe('92nd');
  });

  it('should return the input number with "rd" suffix when the number ends with 3 except for numbers ending with 13', () => {
    expect(ordinal(3)).toBe('3rd');
    expect(ordinal(23)).toBe('23rd');
    expect(ordinal(33)).toBe('33rd');
    expect(ordinal(43)).toBe('43rd');
    expect(ordinal(53)).toBe('53rd');
    expect(ordinal(63)).toBe('63rd');
    expect(ordinal(73)).toBe('73rd');
    expect(ordinal(83)).toBe('83rd');
    expect(ordinal(93)).toBe('93rd');
  });

  it('should return the input number with "th" suffix when the number ends with 11, 12, or 13', () => {
    expect(ordinal(11)).toBe('11th');
    expect(ordinal(12)).toBe('12th');
    expect(ordinal(13)).toBe('13th');
    expect(ordinal(111)).toBe('111th');
    expect(ordinal(112)).toBe('112th');
    expect(ordinal(113)).toBe('113th');
  });
});

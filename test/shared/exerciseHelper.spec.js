import initExerciseHelper from '../../functions/shared/exerciseHelper.js';

const config = {
  EXERCISE_STAGE: {
    REVIEW: 'review',
    SHORTLISTED: 'shortlisted',
    SELECTED: 'selected',
    RECOMMENDED: 'recommended',
    HANDOVER: 'handover',
  },
};

const exerciseHelper = initExerciseHelper(config);

describe('shortlistingMethods()', () => {
  it('returns empty array when shortlistingMethods is not an array', () => {
    const exercise = {
      shortlistingMethods: 'not-an-array',
    };
    const result = exerciseHelper.shortlistingMethods(exercise);
    expect(result).toEqual([]);
  });

  it('returns empty array when shortlistingMethods is undefined', () => {
    const exercise = {};
    const result = exerciseHelper.shortlistingMethods(exercise);
    expect(result).toEqual([]);
  });

  it('returns sorted list of methods excluding "other"', () => {
    const exercise = {
      shortlistingMethods: ['other'],
      otherShortlistingMethod: [{ name: 'Custom method' }],
    };
    const result = exerciseHelper.shortlistingMethods(exercise);
    expect(result).toEqual(['Custom method']);
  });



  it('handles multiple methods', () => {
    const exercise = {
      shortlistingMethods: ['situational-judgement-qualifying-test', 'scenario-test-qualifying-test'],
      otherShortlistingMethod: [],
    };
    const result = exerciseHelper.shortlistingMethods(exercise);
    expect(result).toEqual(['Scenario test qualifying test (QT)', 'Situational judgement qualifying test (QT)']);
  });
});

describe('formatSelectionDays()', () => {
  it('returns empty array when exercise is undefined', () => {
    const result = exerciseHelper.formatSelectionDays(undefined);
    expect(result).toEqual([]);
  });

  it('returns empty array when selectionDays is undefined', () => {
    const exercise = {};
    const result = exerciseHelper.formatSelectionDays(exercise);
    expect(result).toEqual([]);
  });

  it('formats single day selection with location', () => {
    const exercise = {
      selectionDays: [{
        selectionDayStart: new Date('2024-01-15'),
        selectionDayEnd: new Date('2024-01-15'),
        selectionDayLocation: 'London',
      }],
    };
    const result = exerciseHelper.formatSelectionDays(exercise);
    expect(result).toEqual(['London - 15/1/2024']);
  });

  it('formats date range with location', () => {
    const exercise = {
      selectionDays: [{
        selectionDayStart: new Date('2024-01-15'),
        selectionDayEnd: new Date('2024-01-17'),
        selectionDayLocation: 'Manchester',
      }],
    };
    const result = exerciseHelper.formatSelectionDays(exercise);
    expect(result).toEqual(['Manchester - 15/1/2024 to 17/1/2024']);
  });

  it('formats multiple selection days', () => {
    const exercise = {
      selectionDays: [
        {
          selectionDayStart: new Date('2024-01-15'),
          selectionDayEnd: new Date('2024-01-15'),
          selectionDayLocation: 'London',
        },
        {
          selectionDayStart: new Date('2024-02-20'),
          selectionDayEnd: new Date('2024-02-22'),
          selectionDayLocation: 'Manchester',
        },
      ],
    };
    const result = exerciseHelper.formatSelectionDays(exercise);
    expect(result).toEqual([
      'London - 15/1/2024',
      'Manchester - 20/2/2024 to 22/2/2024',
    ]);
  });

  it('handles selection day without location', () => {
    const exercise = {
      selectionDays: [{
        selectionDayStart: new Date('2024-01-15'),
        selectionDayEnd: new Date('2024-01-15'),
      }],
    };
    const result = exerciseHelper.formatSelectionDays(exercise);
    expect(result).toEqual(['15/1/2024']);
  });

  it('handles invalid dates', () => {
    const exercise = {
      selectionDays: [{
        selectionDayStart: null,
        selectionDayEnd: new Date('2024-01-15'),
        selectionDayLocation: 'London',
      }],
    };
    const result = exerciseHelper.formatSelectionDays(exercise);
    expect(result).toEqual([]);
  });

  it('handles empty selectionDays array', () => {
    const exercise = {
      selectionDays: [],
    };
    const result = exerciseHelper.formatSelectionDays(exercise);
    expect(result).toEqual([]);
  });
});

import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import initFlagApplicationIssues from '../../../functions/actions/applications/flagApplicationIssues.js';

//const mockDb = jest.fn();
const mockSlack = jest.fn();

const createTimestamp = (year, month, day) => {
  return {
    toDate: () => {
      return new Date(year, month, day);
    },
  };
};

const mockExercise = (id) => {
  return {
    id: id,
    typeOfExercise: 'legal',
    reasonableLengthService: 5,
    otherLOS: null,
    retirementAge: 70,
    otherRetirement: null,
    characterAndSCCDate: createTimestamp(2020, 5, 5),
    postQualificationExperience: 5,
    otherYears: null,
  };
};

const mockApplication = (id) => {
  return {
    id: id,
    canGiveReasonableLOS: true,
    personalDetails: {
      citizenship: 'uk',
      dateOfBirth: createTimestamp(1976, 6, 5),
    },
    qualifications: [
      { date: createTimestamp(1997, 5, 1) },
    ],
    experience: [
      {
        startDate: createTimestamp(1997, 9, 1),
        tasks: ['task1'],
      },
    ],
    employmentGaps: [],
  };
}; 

const flagApplicationIssues = initFlagApplicationIssues(firebase, mockSlack);

xdescribe('getEligibilityIssues()', () => {

  it('returns empty array when no issues', async () => {
    const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), mockApplication('app1'));
    expect(eligibilityIssues.length).toBe(0);
  });

  describe('Citizenship', () => {
    it('returns issue if citizenship not declared', async () => {
      const application = mockApplication('app1');
      application.personalDetails.citizenship = null;
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('citizenship');
    });

    it('can be uk', async () => {
      const application = mockApplication('app1');
      application.personalDetails.citizenship = 'uk';
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('can be republic-of-ireland', async () => {
      const application = mockApplication('app1');
      application.personalDetails.citizenship = 'republic-of-ireland';
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('can be another-commonwealth-country', async () => {
      const application = mockApplication('app1');
      application.personalDetails.citizenship = 'another-commonwealth-country';
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('returns issue if citizenship is not UK, RoI or Commonwealth', async () => {
      const application = mockApplication('app1');
      application.personalDetails.citizenship = 'spain';
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('citizenship');
    });

  });

  describe('Reasonable length of service', () => {
    it('returns issue if date of birth not provided', async () => {
      const application = mockApplication('app1');
      application.personalDetails.dateOfBirth = null;
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('rls');
    });

    it('returns issue if candidate has declared cannot meet requirements', async () => {
      const application = mockApplication('app1');
      application.canGiveReasonableLOS = false;
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(mockExercise('ex1'), application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('rls');
    });

    it('returns issue if candidate will be older than retirement age at end of service', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      exercise.characterAndSCCDate = createTimestamp(2015, 5, 5);
      exercise.reasonableLengthService = 5;
      exercise.retirementAge = 70;
      application.personalDetails.dateOfBirth = createTimestamp(1950, 5, 4);
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('rls');
    });

    it('can equal retirement age at end of service', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      exercise.characterAndSCCDate = createTimestamp(2015, 5, 5);
      exercise.reasonableLengthService = 5;
      exercise.retirementAge = 70;
      application.personalDetails.dateOfBirth = createTimestamp(1950, 5, 5);
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('can be younger than retirement age at end of service', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      exercise.characterAndSCCDate = createTimestamp(2015, 5, 5);
      exercise.reasonableLengthService = 5;
      exercise.retirementAge = 70;
      application.personalDetails.dateOfBirth = createTimestamp(1950, 5, 6);
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('handles custom retirement age', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      exercise.characterAndSCCDate = createTimestamp(2015, 5, 5);
      exercise.reasonableLengthService = 5;
      exercise.retirementAge = 'other';
      exercise.otherRetirement = 65;
      application.personalDetails.dateOfBirth = createTimestamp(1950, 5, 6);
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('rls');
    });

    it('handles custom length of service', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      exercise.characterAndSCCDate = createTimestamp(2015, 5, 5);
      exercise.reasonableLengthService = 'other';
      exercise.otherLOS = 10;
      exercise.retirementAge = 70;
      application.personalDetails.dateOfBirth = createTimestamp(1950, 5, 6);
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('rls');
    });

  });

  describe('Post-qualification experience', () => {
    it('only applies to legal and leadership exercises', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.qualifications = [];
      exercise.typeOfExercise = 'legal';
      expect(flagApplicationIssues.getEligibilityIssues(exercise, application).length).toBe(1);
      exercise.typeOfExercise = 'leadership';
      expect(flagApplicationIssues.getEligibilityIssues(exercise, application).length).toBe(1);
      exercise.typeOfExercise = 'non-legal';
      expect(flagApplicationIssues.getEligibilityIssues(exercise, application).length).toBe(0);
    });

    it('returns issue if candidate has no qualifications', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.qualifications = [];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
    });

    it('returns issue if earliest qualification is too recent', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.qualifications = [
        { date: createTimestamp(2019, 0, 1) },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
    });

    it('returns issue if no experience provided', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.experience = [];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
    });

    it('returns issue if not got enough experience', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.experience = [
        {
          startDate: createTimestamp(2018, 9, 1),
          tasks: ['task1'],
        },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
    });

    it('includes post-qualification experience from roles which started before qualification', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.qualifications = [
        { date: createTimestamp(2010, 0, 1) },
      ];
      application.experience = [
        {
          startDate: createTimestamp(2009, 0, 1),
          tasks: ['task1'],
        },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('combines experience from different roles', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.qualifications = [
        { date: createTimestamp(2010, 0, 1) },
      ];
      application.experience = [
        {
          startDate: createTimestamp(2010, 0, 1),
          endDate: createTimestamp(2014, 0, 1),
          tasks: ['task1'],
        },
        {
          startDate: createTimestamp(2015, 1, 1),
          endDate: createTimestamp(2016, 1, 1),
          tasks: ['task1'],
        },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('returns issue if experience is one day less than required PQE', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.qualifications = [
        { date: createTimestamp(2010, 0, 1) },
      ];
      application.experience = [
        {
          startDate: createTimestamp(2010, 0, 1),
          endDate: createTimestamp(2014, 0, 1),
          tasks: ['task1'],
        },
        {
          startDate: createTimestamp(2015, 1, 1),
          endDate: createTimestamp(2016, 0, 30),
          tasks: ['task1'],
        },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
    });

    it('handles custom length of post-qualification experience', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      exercise.postQualificationExperience = 'other';
      exercise.otherYears = 8;
      application.qualifications = [
        { date: createTimestamp(2010, 0, 1) },
      ];
      application.experience = [
        {
          startDate: createTimestamp(2010, 0, 1),
          endDate: createTimestamp(2017, 0, 1),
          tasks: ['task1'],
        },
      ];
      let eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
      application.experience = [
        {
          startDate: createTimestamp(2010, 0, 1),
          endDate: createTimestamp(2018, 0, 1),
          tasks: ['task1'],
        },
      ];
      eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(0);
    });

    it('should not count over-lapping experience twice', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.experience = [
        {
          startDate: createTimestamp(2010, 0, 1),
          endDate: createTimestamp(2014, 0, 1),
          tasks: ['task1'],
        },
        {
          startDate: createTimestamp(2011, 0, 1),
          endDate: createTimestamp(2014, 0, 1),
          tasks: ['task1'],
        },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
    });


    it('should include summary of relevant experience if there\'s an issue', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.experience = [
        {
          startDate: createTimestamp(2010, 0, 1),
          endDate: createTimestamp(2014, 0, 2), // 4 years and 1 day
          tasks: ['task1'],
        },
        {
          startDate: createTimestamp(2014, 3, 3),
          endDate: createTimestamp(2014, 4, 4), // 1 month and 1 day
          tasks: ['task1'],
        },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
      expect(eligibilityIssues[0].summary).toBe('Candidate has 4 years, 1 month and 2 days of relevant experience');
    });

    it('should include summary of other experience if there\'s an issue', async () => {
      const exercise = mockExercise('ex1');
      const application = mockApplication('app1');
      application.experience = [
        {
          startDate: createTimestamp(2010, 0, 1),
          endDate: createTimestamp(2014, 0, 2), // 4 years and 1 day
          tasks: ['task1'],
        },
        {
          startDate: createTimestamp(2014, 3, 3),
          endDate: createTimestamp(2014, 4, 4), // 1 month and 1 day
          tasks: ['other'],
        },
      ];
      const eligibilityIssues = flagApplicationIssues.getEligibilityIssues(exercise, application);
      expect(eligibilityIssues.length).toBe(1);
      expect(eligibilityIssues[0].type).toBe('pqe');
      expect(eligibilityIssues[0].summary).toBe('Candidate has 4 years and 1 day of relevant experience and 1 month and 1 day to be checked');
    });

  });

});

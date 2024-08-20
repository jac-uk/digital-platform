// @TODO makes sense to use emulator to test these
import { jest } from '@jest/globals';

const mockDb = jest.fn();
const mockSlack = jest.fn();

// const createTimestamp = (year, month, day) => {
//   return {
//     toDate: () => {
//       return new Date(year, month, day);
//     },
//   };
// };

// const mockExercise = (id) => {
//   return {
//     id: id,
//     typeOfExercise: 'legal',
//     reasonableLengthService: 5,
//     otherLOS: null,
//     retirementAge: 70,
//     otherRetirement: null,
//     characterAndSCCDate: createTimestamp(2020, 5, 5),
//     postQualificationExperience: 5,
//     otherYears: null,
//   };
// };

// const mockApplication = (id) => {
//   return {
//     id: id,
//     canGiveReasonableLOS: true,
//     personalDetails: {
//       citizenship: 'uk',
//       dateOfBirth: createTimestamp(1976, 6, 5),
//     },
//     qualifications: [
//       { date: createTimestamp(1997, 5, 1) },
//     ],
//     experience: [
//       {
//         startDate: createTimestamp(1997, 9, 1),
//         tasks: ['task1'],
//       },
//     ],
//     employmentGaps: [],
//   };
// };

import initAssessments from '../../functions/actions/assessments.js';
const assessments = initAssessments(mockDb, mockSlack);

describe('initialiseAssessments()', () => {

  it.skip('returns true when no issues', async () => {
    const result = assessments.initialiseAssessments('assessment1');
    expect(result).toBe(true);
  });

});

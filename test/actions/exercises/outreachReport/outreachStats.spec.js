import firebase from 'firebase-admin';
import { jest } from '@jest/globals';
import config from '../../../../nodeScripts/shared/config.js';
import initGenerateOutreachReport from '../../../../functions/actions/exercises/generateOutreachReport.js';

const db = jest.fn();

const {
  outreachStats,
} = initGenerateOutreachReport(config, firebase, db);

const applications = [
  {
    additionalInfo: {
      listedSources: [], // Gets picked up as noAnswer
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'jac-website',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'professional-body-website-or-email',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'professional-body-magazine',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'judicial-office-extranet',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'judging-your-future-newsletter',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'twitter',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'linked-in',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'word-of-mouth',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'other',
      ],
    },
  },
  {
    additionalInfo: {
      listedSources: [
        'prefer-not-to-say',
      ],
    },
  },
  {
    missingKey: {}, // Gets picked up as noAnswer
  },
  {
    additionalInfo: {
      listedSources: [
        'twitter',
        'linked-in',
      ],
    },
  },
];

// Expected Results
const results = {
  total: 13,
  'jac-website': { total: 1, percent: 10 },
  'professional-body-website-or-email': { total: 1, percent: 10 },
  'professional-body-magazine': { total: 1, percent: 10 },
  'judicial-office-extranet':  { total: 1, percent: 10 },
  'judging-your-future-newsletter':  { total: 1, percent: 10 },
  'twitter':  { total: 2, percent: 20 },
  'linked-in':  { total: 2, percent: 20 },
  'word-of-mouth':  { total: 1, percent: 10 },
  'other':  { total: 1, percent: 10 },
  preferNotToSay: { total: 1, percent: 0 },
  noAnswer: { total: 2, percent: 0 },
  declaration: { total: 10, percent: ((10/13) * 100) },
};

describe('outreachStats', () => {

  it('returns outreach stats', async () => {

    const resultData = outreachStats(applications);
    expect(resultData.total).toEqual(results.total);
    expect(resultData['jac-website'].total).toEqual(results['jac-website'].total);
    expect(resultData['jac-website'].percent).toBeCloseTo(results['jac-website'].percent);

    expect(resultData['professional-body-website-or-email'].total).toEqual(results['professional-body-website-or-email'].total);
    expect(resultData['professional-body-website-or-email'].percent).toBeCloseTo(results['professional-body-website-or-email'].percent);

    expect(resultData['professional-body-magazine'].total).toEqual(results['professional-body-magazine'].total);
    expect(resultData['professional-body-magazine'].percent).toBeCloseTo(results['professional-body-magazine'].percent);

    expect(resultData['judicial-office-extranet'].total).toEqual(results['judicial-office-extranet'].total);
    expect(resultData['judicial-office-extranet'].percent).toBeCloseTo(results['judicial-office-extranet'].percent);

    expect(resultData['judging-your-future-newsletter'].total).toEqual(results['judging-your-future-newsletter'].total);
    expect(resultData['judging-your-future-newsletter'].percent).toBeCloseTo(results['judging-your-future-newsletter'].percent);

    expect(resultData['twitter'].total).toEqual(results['twitter'].total);
    expect(resultData['twitter'].percent).toBeCloseTo(results['twitter'].percent);

    expect(resultData['linked-in'].total).toEqual(results['linked-in'].total);
    expect(resultData['linked-in'].percent).toBeCloseTo(results['linked-in'].percent);

    expect(resultData['word-of-mouth'].total).toEqual(results['word-of-mouth'].total);
    expect(resultData['word-of-mouth'].percent).toBeCloseTo(results['word-of-mouth'].percent);

    expect(resultData.other.total).toEqual(results.other.total);
    expect(resultData.preferNotToSay.total).toEqual(results.preferNotToSay.total);
    expect(resultData.noAnswer.total).toEqual(results.noAnswer.total);
    
    expect(resultData.declaration.total).toEqual(results.declaration.total);
    expect(resultData.declaration.percent).toBeCloseTo(results.declaration.percent);
  });

});

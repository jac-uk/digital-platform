/* eslint-disable quotes */

import { getSearchMap } from '../../functions/shared/search.js';

describe('getSearchMap()', () => {

  it('returns empty object when parameter not provided', async () => {
    const result = getSearchMap();
    expect(result).toStrictEqual({});
  });

  it('returns results when parameter provided', async () => {
    const searchables = [
      "test12@test.com",
      "test tester",
    ];
    const expectedResults = {
      "tes": true,
      "est": true,
      "st1": true,
      "t12": true,
      "12-": true,
      "2-t": true,
      "-te": true,
      "st-": true,
      "t-c": true,
      "-co": true,
      "com": true,
      "st ": true,
      "t t": true,
      " te": true,
      "ste": true,
      "ter": true,
    };
    const result = getSearchMap(searchables);
    expect(result).toStrictEqual(expectedResults);
  });

  it('works with apostrophe in surname', async () => {
    const searchables = [
      "john o' reilly",
    ];
    const expectedResults = {
      "joh": true,
      "ohn": true,
      "hn ": true,
      "n o": true,
      " o'": true,
      "o' ": true,
      "' r": true,
      " re": true,
      "rei": true,
      "eil": true,
      "ill": true,
      "lly": true,
    };
    const result = getSearchMap(searchables);
    expect(result).toStrictEqual(expectedResults);
  });
});

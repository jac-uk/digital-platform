import assert from 'assert';
import { firebaseFunctionsTest } from './helpers.js';
import verifyRecaptcha from '../../functions/callableFunctions/verifyRecaptcha.js';

const { wrap } = firebaseFunctionsTest;

describe('verifyRecaptcha', () => {
  it ('empty parameter', async () => {
    const wrapped = wrap(verifyRecaptcha);
    try {
      const res = await wrapped({});
      console.log(res);
    } catch (e) {
      assert.equal(e.code, 'invalid-argument');
    }
  });
  it ('invalid token', async () => {
    const wrapped = wrap(verifyRecaptcha);
    const res = await wrapped({ token: '123' });
    assert.equal(res.success, false);
    assert.notEqual(res['error-codes'].indexOf('invalid-input-response'), -1);
  });
});

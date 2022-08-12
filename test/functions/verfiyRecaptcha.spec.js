const assert = require('assert');
const { firebaseFunctionsTest } = require('./helpers');
const verfiyRecaptcha = require('../../functions/callableFunctions/verfiyRecaptcha');

const { wrap } = firebaseFunctionsTest;

describe('verfiyRecaptcha', () => {
  it ('empty parameter', async () => {
    const wrapped = wrap(verfiyRecaptcha);
    try {
      const res = await wrapped({});
      console.log(res);
    } catch (e) {
      assert.equal(e.code, 'invalid-argument');
    }
  });
  it ('invalid token', async () => {
    const wrapped = wrap(verfiyRecaptcha);
    const res = await wrapped({ token: '123' });
    assert.equal(res.success, false);
    assert.notEqual(res['error-codes'].indexOf('invalid-input-response'), -1);
  });
});

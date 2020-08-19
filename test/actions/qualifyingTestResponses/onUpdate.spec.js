
const config = require('../../../functions/shared/config');
const { firebase } = require('firebase-admin');
// @TODO use firebase testing tools (and emulator)
const mockDb = jest.fn();

const onQualifyingTestResponsesUpdate = require('../../../functions/actions/qualifyingTestResponses/onUpdate')(config, firebase, mockDb);

describe('onQualifyingTestResponsesUpdate()', () => {

  xit('increments qualifyingTest started count when test is started', async () => {
    const dataBefore = {
      status: 'activated',
    };
    const dataAfter = {
      status: 'started',
    };
    onQualifyingTestResponsesUpdate(dataBefore, dataAfter);
    expect(mockDb).toBe();
  });

});

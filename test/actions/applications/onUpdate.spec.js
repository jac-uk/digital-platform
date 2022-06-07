'use strict';

const mockConfig = jest.fn();
const mockFirebase = jest.fn();
const mockDb = jest.fn();
const mockApplicationId = '0000';

const onUpdate = require('../../../functions/actions/applications/onUpdate')(mockConfig, mockFirebase, mockDb);

xdescribe('onUpdate()', () => {
  const mockDataBefore = {};
  const mockDataAfter = {
    referenceNumber: 'JAC-01010',
  };
  xit('runs', async () => {
    expect(onUpdate(mockApplicationId, mockDataBefore, mockDataAfter)).toBe(false);
  });
});

const { setup, teardown } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('Notifications', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading notifications', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('notifications').get());
    });

    it('allow JAC admin with permission to read notifications', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['n1'] });
      await assertSucceeds(db.collection('notifications').get());
    });
  });
});

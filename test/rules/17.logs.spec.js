const { setup, teardown } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const PERMISSIONS = require('../../functions/shared/permissions');

describe('Logs', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading login logs', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('logs').doc('login').get());
    });

    it('allow JAC admin with permission to read login logs', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.logs.permissions.canReadLogs.value] });
      await assertSucceeds(db.collection('logs').doc('login/1/1').get());
    });

    it('prevent JAC admin without permission from reading event logs', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('logs').doc('type/events/1').get());
    });

    it('allow JAC admin with permission to read event logs', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.logs.permissions.canReadLogs.value] });
      await assertSucceeds(db.collection('logs').doc('type/events/1').get());
    });
  });

});

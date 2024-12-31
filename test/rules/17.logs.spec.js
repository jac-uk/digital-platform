import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

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

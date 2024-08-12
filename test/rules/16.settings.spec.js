import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Settings', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading settings', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('settings').doc('services').get());
    });

    it('allow JAC admin with permission to read settings', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.settings.permissions.canReadSettings.value] });
      await assertSucceeds(db.collection('settings').doc('services').get());
    });
  });

  context('Update', () => {
    it('prevent JAC admin without permission from updating settings', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'settings/services': {} }
      );
      await assertFails(db.collection('settings').doc('services').update({}));
    });

    it('allow JAC admin with permission to update settings', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.settings.permissions.canUpdateSettings.value] },
        { 'settings/services': {} }
      );
      await assertSucceeds(db.collection('settings').doc('services').update({}));
    });
  });

});

import { setup, teardown } from './helpers.js';
import { assertFails } from '@firebase/rules-unit-testing';

describe('Database', () => {
  after(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a new collection', async () => {
      const db = await setup();
      await assertFails(db.collection('some-nonexistent-collection').add({}));
    });
    it('prevent authenticated user from creating a new collection', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('some-nonexistent-collection').add({}));
    });
    it('prevent authenticated user with verified @judicialappointments.digital email from creating a new collection', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('some-nonexistent-collection').add({}));
    });
    it('prevent authenticated user with verified @judicialappointments.gov.uk email from creating a new collection', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('some-nonexistent-collection').add({}));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading unknown collections', async () => {
      const db = await setup();
      await assertFails(db.collection('some-nonexistent-collection').get());
    });
    it('prevent authenticated user from reading unknown collections', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('some-nonexistent-collection').get());
    });
    it('prevent authenticated user with verified @judicialappointments.digital email from reading unknown collections', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('some-nonexistent-collection').get());
    });
    it('prevent authenticated user with verified @judicialappointments.gov.uk email from reading unknown collections', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('some-nonexistent-collection').get());
    });
  });

});

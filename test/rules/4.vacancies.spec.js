import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Vacancies', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a vacancy', async () => {
      const db = await setup();
      await assertFails(db.collection('vacancies').add({}));
    });

    it('prevent authenticated user from creating a vacancy', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('vacancies').add({}));
    });
  });

  context('Read', () => {
    it('allow un-authenticated user to read a vacancy', async () => {
      const db = await setup();
      await assertSucceeds(db.collection('vacancies').get());
      await assertSucceeds(db.collection('vacancies').doc('vac1').get());
    });

    it('allow authenticated user to read a vacancy', async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.collection('vacancies').get());
      await assertSucceeds(db.collection('vacancies').doc('vac1').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a vacancy', async () => {
      const db = await setup();
      await assertFails(db.collection('vacancies').doc('vac1').update({}));
    });

    it('prevent authenticated user from updating a vacancy', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('vacancies').doc('vac1').update({}));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a vacancy', async () => {
      const db = await setup();
      await assertFails(db.collection('vacancies').doc('vac1').delete());
    });

    it('prevent authenticated user from deleting a vacancy', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('vacancies').doc('vac1').delete());
    });
  });

});

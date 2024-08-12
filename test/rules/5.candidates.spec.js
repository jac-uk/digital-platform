import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Candidates', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a candidate', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').add({}));
    });
    it('prevent authenticated user from creating a random candidate', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').add({}));
    });
    it('allow authenticated user to create own candidate', async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.collection('candidates').doc('user1').set({}));
    });
    it('prevent authenticated JAC user without permission from creating candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidates').doc('random').set({}));
    });
    it('allow authenticated JAC user with permission to create candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canCreateCandidates.value] });
      await assertSucceeds(db.collection('candidates').doc('random').set({}));
    });
    it('prevent authenticated JAC user without permission from creating candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.doc('candidates/random/documents/personalDetails').set({}));
    });
    it('allow authenticated JAC user with permission to create candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canCreateCandidates.value] });
      await assertSucceeds(db.doc('candidates/random/documents/personalDetails').set({}));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading candidate data', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').get());
    });

    it('prevent authenticated user from reading candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').get());
    });

    it('allow authenticated user to read their own candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.doc('candidates/user1').get());
    });

    it('prevent authenticated user from reading anothers candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.doc('candidates/user2').get());
    });
    it('prevent authenticated JAC user without permission from reading candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidates').get());
    });
    it('allow authenticated JAC user with permission to read candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canReadCandidates.value] });
      await assertSucceeds(db.collection('candidates').get());
    });
    it('prevent authenticated JAC user without permission from reading candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.doc('candidates/user2').get());
    });
    it('allow authenticated JAC user with permission to read candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canReadCandidates.value] });
      await assertSucceeds(db.doc('candidates/user2').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating candidate data', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').doc('user1').update({}));
    });
    it('prevent authenticated user from updating someone elses candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').doc('user2').update({}));
    });
    it('allow authenticated user to update own candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertSucceeds(db.collection('candidates').doc('user1').update({}));
    });
    it('prevent authenticated JAC user without permission from updating candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidates').doc('user2').update({}));
    });
    it('allow authenticated JAC user with permission to update candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canUpdateCandidates.value] });
      await assertSucceeds(db.collection('candidates').doc('user1').update({}));
    });
    it('prevent authenticated JAC user without permission from updating candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidates').doc('user2').update({}));
    });
    it('allow authenticated JAC user with permission to update candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canUpdateCandidates.value] });
      await assertSucceeds(db.collection('candidates').doc('user1').update({}));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a candidate', async () => {
      const db = await setup();
      await assertFails(db.collection('candidates').doc('user1').delete());
    });
    it('prevent authenticated user from deleting someone elses candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').doc('user2').delete());
    });
    it('prevent authenticated user from deleting own candidate data', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('candidates').doc('user1').delete());
    });
    it('prevent authenticated JAC user without permission from deleting candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidates').doc('user2').delete());
    });
    it('allow authenticated JAC user with permission to delete candidate', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canDeleteCandidates.value] });
      await assertSucceeds(db.collection('candidates').doc('user2').delete());
    });
    it('prevent authenticated JAC user without permission from deleting candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidates').doc('user2').delete());
    });
    it('allow authenticated JAC user with permission to delete candidate documents', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidates.permissions.canDeleteCandidates.value] });
      await assertSucceeds(db.collection('candidates').doc('user2').delete());
    });
  });

});

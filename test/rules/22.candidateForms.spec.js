import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

const newFormData = { exercise: { id: 'test' } };

describe('Candidate Forms', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a candidate form', async () => {
      const db = await setup();
      await assertFails(db.collection('candidateForms').add(newFormData));
    });

    it('prevent authenticated user from creating a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('candidateForms').add(newFormData));
    });

    it('prevent authenticated user with verified email from creating a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('candidateForms').add(newFormData));
    });

    it('prevent authenticated user with un-verified JAC email from creating a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('candidateForms').add(newFormData));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to create a candidate form with no data', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('candidateForms').add({}));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from creating a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('candidateForms').add(newFormData));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from creating a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidateForms').add(newFormData));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to create a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.candidateForms.permissions.canCreate.value] });
      await assertSucceeds(db.collection('candidateForms').add(newFormData));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to create a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidateForms.permissions.canCreate.value] });
      await assertSucceeds(db.collection('candidateForms').add(newFormData));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading candidate form', async () => {
      const db = await setup();
      await assertFails(db.collection('candidateForms').get());
    });

    it('prevent authenticated user from reading candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('candidateForms').get());
    });

    it('prevent authenticated user with verified email from reading candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('candidateForms').get());
    });

    it('prevent authenticated user with un-verified JAC email from reading candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('candidateForms').get());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from reading candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('candidateForms').get());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from reading candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidateForms').get());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.candidateForms.permissions.canRead.value] });
      await assertSucceeds(db.collection('candidateForms').get());
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.candidateForms.permissions.canRead.value] });
      await assertSucceeds(db.collection('candidateForms').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a candidate form', async () => {
      const db = await setup(null, { 'candidateForms/ux1': { } });
      await assertFails(db.collection('candidateForms').doc('ux1').update(newFormData));
    });

    it('prevent authenticated user from updating a candidate form', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: false },
        { 'candidateForms/ux1': { } }
      );
      await assertFails(db.collection('candidateForms').doc('ux1').update(newFormData));
    });

    it('prevent authenticated user with verified email from updating a candidate form', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: true },
        { 'candidateForms/ux1': { } }
      );
      await assertFails(db.collection('candidateForms').doc('ux1').update(newFormData));
    });

    it('prevent authenticated user with un-verified JAC email from updating a candidate form', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false },
        { 'candidateForms/ux1': { } }
      );
      await assertFails(db.collection('candidateForms').doc('ux1').update(newFormData));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to update a candidate form with missing data', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'candidateForms/ux1': { } }
      );
      await assertFails(db.collection('candidateForms').doc('ux1').update(newFormData));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from updating a candidate form', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'candidateForms/ux1': { } }
      );
      await assertFails(db.collection('candidateForms').doc('ux1').update(newFormData));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from updating a candidate form', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'candidateForms/ux1': { } }
      );
      await assertFails(db.collection('candidateForms').doc('ux1').update(newFormData));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to change a panellist', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.candidateForms.permissions.canUpdate.value] },
        { 'candidateForms/ux1': { } }
      );
      await assertSucceeds(db.collection('candidateForms').doc('ux1').update(newFormData));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a candidate form', async () => {
      const db = await setup();
      await assertFails(db.collection('candidateForms').doc('ux1').delete());
    });

    it('prevent authenticated user from deleting a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('candidateForms').doc('ux1').delete());
    });

    it('prevent authenticated user with verified email from deleting a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('candidateForms').doc('ux1').delete());
    });

    it('prevent authenticated user with un-verified JAC email from deleting a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('candidateForms').doc('ux1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from deleting a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('candidateForms').doc('ux1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permisssion from deleting a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('candidateForms').doc('ux1').delete());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to delete a candidate form', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.candidateForms.permissions.canDelete.value] });
      await assertSucceeds(db.collection('candidateForms').doc('ux1').delete());
    });
  });

});

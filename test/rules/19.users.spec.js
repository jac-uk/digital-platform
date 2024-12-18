import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Users', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a user', async () => {
      const db = await setup();
      await assertFails(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$'}));
    });

    it('prevent authenticated user from creating a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$'} ));
    });

    it('prevent authenticated user with verified email from creating a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$'} ));
    });

    it('prevent authenticated user with un-verified JAC email from creating a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to create a user with no data', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('users').add({}));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from creating a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from creating a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to create a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.users.permissions.canCreateUsers.value] });
      await assertSucceeds(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to create a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.users.permissions.canCreateUsers.value] });
      await assertSucceeds(db.collection('users').add({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading users', async () => {
      const db = await setup();
      await assertFails(db.collection('users').get());
    });

    it('prevent authenticated user from reading users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('users').get());
    });

    it('prevent authenticated user with verified email from reading users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('users').get());
    });

    it('prevent authenticated user with un-verified JAC email from reading users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('users').get());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from reading users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('users').get());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from reading users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('users').get());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.users.permissions.canReadUsers.value] });
      await assertSucceeds(db.collection('users').get());
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.users.permissions.canReadUsers.value] });
      await assertSucceeds(db.collection('users').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a user', async () => {
      const db = await setup(null, { 'users/ux1': { } });
      await assertFails(db.collection('users').doc('ux1').update({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user from updating a user', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: false },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('users').doc('ux1').update({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user with verified email from updating a user', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('users').doc('ux1').update({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user with un-verified JAC email from updating a user', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('users').doc('ux1').update({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to update a user with missing data', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('users').doc('ux1').update({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from updating a user', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('users').doc('ux1').update({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from updating a user', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('users').doc('ux1').update({ email: 'test@test.com', password: 'PDncjhbHBHBH12!$' }));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to change a user role', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.users.permissions.canChangeUserRole.value] },
        { 'users/ux1': { } }
      );
      await assertSucceeds(db.collection('users').doc('ux1').update({ role: { id: 'test', isChanged: true } }));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a user', async () => {
      const db = await setup();
      await assertFails(db.collection('users').doc('ux1').delete());
    });

    it('prevent authenticated user from deleting a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('users').doc('ux1').delete());
    });

    it('prevent authenticated user with verified email from deleting a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('users').doc('ux1').delete());
    });

    it('prevent authenticated user with un-verified JAC email from deleting a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('users').doc('ux1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from deleting a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('users').doc('ux1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permisssion from deleting a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('users').doc('ux1').delete());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to delete a user', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.users.permissions.canDeleteUsers.value] });
      await assertSucceeds(db.collection('users').doc('ux1').delete());
    });
  });

});

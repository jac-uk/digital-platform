import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Roles', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a role', async () => {
      const db = await setup();
      await assertFails(db.collection('roles').add({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user from creating a role', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('roles').add({ roleName: 'RoleA' } ));
    });

    it('prevent authenticated user with verified email from creating a role', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('roles').add({ roleName: 'RoleA' } ));
    });

    it('prevent authenticated user with un-verified JAC email from creating a role', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('roles').add({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to create a role with no data', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('roles').add({}));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from creating a role', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('roles').add({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from creating a role', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('roles').add({ roleName: 'RoleA' }));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to create a role', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.users.permissions.canCreateRoles.value] });
      await assertSucceeds(db.collection('roles').add({ roleName: 'RoleA' }));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to create a role', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.users.permissions.canCreateRoles.value] });
      await assertSucceeds(db.collection('roles').add({ roleName: 'RoleA' }));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading roles', async () => {
      const db = await setup();
      await assertFails(db.collection('roles').get());
    });

    it('prevent authenticated user from reading roles', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('roles').get());
    });

    it('prevent authenticated user with verified email from reading roles', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('roles').get());
    });


    // @TODO: WHY DOES BELOW NOT WORK WHEN IT DOES IN THE EQUIVALENT TEST IN USER??

    // it('prevent authenticated user with un-verified JAC email from reading roles', async () => {
    //   const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
    //   await assertFails(db.collection('roles').get());
    // });

    // it('prevent authenticated user with verified @judicialappointments.digital email but without permission from reading roles', async () => {
    //   const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
    //   await assertFails(db.collection('roles').get());
    // });

    // it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from reading roles', async () => {
    //   const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
    //   await assertFails(db.collection('roles').get());
    // });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.users.permissions.canCreateRoles.value] });
      await assertSucceeds(db.collection('roles').get());
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to read users', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.users.permissions.canCreateRoles.value] });
      await assertSucceeds(db.collection('roles').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a role', async () => {
      const db = await setup(null, { 'users/ux1': { } });
      await assertFails(db.collection('roles').doc('ux1').update({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user from updating a role', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: false },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('roles').doc('ux1').update({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user with verified email from updating a role', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('roles').doc('ux1').update({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user with un-verified JAC email from updating a role', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('roles').doc('ux1').update({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to update a role with missing data', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('roles').doc('ux1').update({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from updating a role', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('roles').doc('ux1').update({ roleName: 'RoleA' }));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from updating a role', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'users/ux1': { } }
      );
      await assertFails(db.collection('roles').doc('ux1').update({ roleName: 'RoleA' }));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to update users', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.users.permissions.canEditRolePermissions.value] },
        { 'roles/rx1': { } }
      );
      await assertSucceeds(db.collection('roles').doc('rx1').update({ roleName: 'RoleA' }));
    });
  });
  
});

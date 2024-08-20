import { setup, teardown, getValidMessageData } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Messages', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating a message', async () => {
      const db = await setup();
      await assertFails(db.collection('messages').add(getValidMessageData()));
    });

    it('prevent un-authenticated user from creating a message', async () => {
      const db = await setup();
      await assertFails(db.collection('messages').add(getValidMessageData()));
    });

    it('prevent authenticated user from creating a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('messages').add(getValidMessageData()));
    });

    it('prevent authenticated user with verified email from creating a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('messages').add(getValidMessageData()));
    });

    it('prevent authenticated user with un-verified JAC email from creating a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('messages').add(getValidMessageData()));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to create a message with no data', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('messages').add({}));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from creating a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('messages').add(getValidMessageData()));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from creating a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('messages').add(getValidMessageData()));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to create a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.messages.permissions.canCreateMessages.value] });
      await assertSucceeds(db.collection('messages').add(getValidMessageData()));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to create a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.messages.permissions.canCreateMessages.value] });
      await assertSucceeds(db.collection('messages').add(getValidMessageData()));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading messages', async () => {
      const db = await setup();
      await assertFails(db.collection('messages').get());
    });

    it('prevent authenticated user from reading messages', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('messages').get());
    });

    it('prevent authenticated user with verified email from reading messages', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('messages').get());
    });

    it('prevent authenticated user with un-verified JAC email from reading messages', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('messages').get());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from reading messages', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('messages').get());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from reading messages', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('messages').get());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to read messages', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.messages.permissions.canReadMessages.value] });
      await assertSucceeds(db.collection('messages').get());
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to read messages', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.messages.permissions.canReadMessages.value] });
      await assertSucceeds(db.collection('messages').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a message', async () => {
      const db = await setup(null,  { 'messages/m1': { } });
      await assertFails(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('prevent authenticated user from updating a message', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: false },
        { 'messages/m1': { } }
      );
      await assertFails(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('prevent authenticated user with verified email from updating a message', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: true },
        { 'messages/m1': { } }
      );
      await assertFails(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('prevent authenticated user with un-verified JAC email from updating a message', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false },
        { 'messages/m1': { } }
      );
      await assertFails(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to update a message with missing data', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'messages/m1': { } }
      );
      await assertFails(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from updating a message', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'messages/m1': { } }
      );
      await assertFails(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from updating a message', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'messages/m1': { } }
      );
      await assertFails(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to update a message', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.messages.permissions.canUpdateMessages.value] },
        { 'messages/m1': { } }
      );
      await assertSucceeds(db.collection('messages').doc('m1').update(getValidMessageData()));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to update a message', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.messages.permissions.canUpdateMessages.value] },
        { 'messages/m1': { } }
      );
      await assertSucceeds(db.collection('messages').doc('m1').update(getValidMessageData()));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a message', async () => {
      const db = await setup();
      await assertFails(db.collection('messages').doc('m1').delete());
    });

    it('prevent authenticated user from deleting a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('messages').doc('m1').delete());
    });

    it('prevent authenticated user with verified email from deleting a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('messages').doc('m1').delete());
    });

    it('prevent authenticated user with un-verified JAC email from deleting a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('messages').doc('m1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from deleting a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('messages').doc('m1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permisssion from deleting a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('messages').doc('m1').delete());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to delete a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.messages.permissions.canDeleteMessages.value] });
      await assertSucceeds(db.collection('messages').doc('m1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email and permission to delete a message', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.messages.permissions.canDeleteMessages.value] });
      await assertSucceeds(db.collection('messages').doc('m1').delete());
    });
  });


});

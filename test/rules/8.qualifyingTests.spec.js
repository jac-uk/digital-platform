const { setup, teardown, setupAdmin } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const COLLECTION_NAME = 'qualifyingTests';

describe(COLLECTION_NAME, () => {
  afterEach(async () => {
    await teardown();
  });

  const today = new Date();
  const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  // const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
  const dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
  // const dayBeforeYesterday = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));

  const mockData = { 'qualifyingTests/qt1': { type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow } };
  const mockUnverifiedUser = { uid: 'user1', email: 'user@email.com', email_verified: false };
  const mockVerifiedUser = { uid: 'user1', email: 'user@email.com', email_verified: true };
  const mockUnverifiedJACUser = { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false };
  const mockVerifiedJACUser = { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true };
  const mockVerifiedJACDigitalUser = { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true };

  context('Create', () => {
    it('prevent un-authenticated user from creating a qualifying test', async () => {
      const db = await setup();
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user from creating a qualifying test', async () => {
      const db = await setup(mockUnverifiedUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with verified email from creating a qualifying test', async () => {
      const db = await setup(mockVerifiedUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with un-verified JAC email from creating a qualifying test', async () => {
      const db = await setup(mockUnverifiedJACUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from creating a qualifying test', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission to create a qualifying test', async () => {
      const db = await setup(mockVerifiedJACUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('allow authenticated user with verified @judicialappointments.digital email with permission to create a qualifying test', async () => {
      const db = await setup({ ...mockVerifiedJACDigitalUser, rp: ['qt2'] });
      await assertSucceeds(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email with permission to create a qualifying test', async () => {
      const db = await setup({ ...mockVerifiedJACUser, rp: ['qt2'] });
      await assertSucceeds(db.collection(COLLECTION_NAME).add(mockData));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from listing qualifying tests', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('prevent authenticated user from listing qualifying tests', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('prevent JAC admin without permission from listing qualifying tests', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('allow JAC admin with permission to list qualifying tests', async () => {
      const db = await setup({ ...mockVerifiedJACDigitalUser, rp: ['qt1']});
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).get());
    });

    it('prevent un-authenticated user from reading qualifying test data', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').get());
    });

    it('prevent authenticated user from reading qualifying test data', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').get());
    });

    it('prevent JAC admin without permission from reading qualifying test data', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').get());
    });

    it('allow JAC admin with permission to read qualifying test data', async () => {
      const db = await setup({ ...mockVerifiedJACDigitalUser, rp: ['qt1']});
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating a qualifying test', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user from updating a qualifying test', async () => {
      const db = await setup(mockUnverifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user with verified email from updating a qualifying test', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user with un-verified JAC email from updating a qualifying test', async () => {
      const db = await setup(mockUnverifiedJACUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from updating a qualifying test', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to update a qualifying test', async () => {
      const db = await setup({ ...mockVerifiedJACDigitalUser, rp: ['qt3']});
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from updating a qualifying test', async () => {
      const db = await setup(mockVerifiedJACUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to update a qualifying test', async () => {
      const db = await setup({ ...mockVerifiedJACUser, rp: ['qt3']});
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a qualifying test', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('prevent authenticated user from deleting someone elses qualifying test', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('prevent authenticated user from deleting own qualifying test', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from deleting qualifying test', async () => {
      const db = await setup(mockVerifiedJACUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from deleting qualifying test', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to delete qualifying test', async () => {
      const db = await setup({ ...mockVerifiedJACUser, rp: ['qt4']});
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
    it('allow authenticated user with verified @judicialappointments.digital email and permission to delete qualifying test', async () => {
      const db = await setup({ ...mockVerifiedJACDigitalUser, rp: ['qt4']});
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qt1').delete());
    });
  });

});

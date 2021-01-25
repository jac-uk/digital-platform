const { setup, teardown, setupAdmin } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const COLLECTION_NAME = 'qualifyingTestResponses';

describe(COLLECTION_NAME, () => {
  afterEach(async () => {
    await teardown();
  });

  const today = new Date();
  const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  // const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
  const dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
  // const dayBeforeYesterday = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));

  const mockData = { 'qualifyingTestResponses/qtr1': { qualifyingTest: { type: 'critical_analysis', startDate: today, endDate: tomorrow } } };
  const mockDataOwnedByUser = { 'qualifyingTestResponses/qtr1': { qualifyingTest: { type: 'critical_analysis', startDate: today, endDate: tomorrow }, candidate: { id: 'user1' } } };
  const mockDataOwnedByEmail = { 'qualifyingTestResponses/qtr1': { qualifyingTest: { type: 'critical_analysis', startDate: today, endDate: tomorrow }, candidate: { email: 'user@email.com' } } };
  const mockUnverifiedUser = { uid: 'user1', email: 'user@email.com', email_verified: false };
  const mockVerifiedUser = { uid: 'user1', email: 'user@email.com', email_verified: true };
  const mockUnverifiedJACUser = { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false };
  const mockVerifiedJACUser = { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true };
  const mockVerifiedJACDigitalUser = { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true };

  context('Create', () => {
    it('prevent un-authenticated user from creating a qualifying test response', async () => {
      const db = await setup();
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user from creating a qualifying test response', async () => {
      const db = await setup(mockUnverifiedUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with verified email from creating a qualifying test response', async () => {
      const db = await setup(mockVerifiedUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with verified email from creating a qualifying test response where they are the owner', async () => {
      const db = await setup(mockVerifiedUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockDataOwnedByUser));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to create a qualifying test response', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email to create a qualifying test response', async () => {
      const db = await setup(mockVerifiedJACUser);
      await assertFails(db.collection(COLLECTION_NAME).add(mockData));
    });

  });

  context('Read', () => {
    it('prevent un-authenticated user from listing qualifying test responses', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('prevent authenticated user from listing qualifying test responses', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('prevent authenticated user from listing qualifying test responses', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).get());
    });

    it('allow authenticated user to list their own qualifying test responses', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockDataOwnedByUser);
      await assertSucceeds(db.collection(COLLECTION_NAME).where('candidate.id', '==', 'user1').get());
    });

    it('allow authenticated user to list their own qualifying test dry run responses', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockDataOwnedByEmail);
      await assertSucceeds(db.collection(COLLECTION_NAME).where('candidate.email', '==', 'user@email.com').get());
    });

    it('allow JAC admin to list qualifying test responses', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).get());
    });

    it('prevent un-authenticated user from reading qualifying test response', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').get());
    });

    it('prevent authenticated user from reading qualifying test response', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').get());
    });

    it('allow authenticated user to read their own qualifying test responses', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockDataOwnedByUser);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qtr1').get());
    });

    it('allow JAC admin to read qualifying test response', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qtr1').get());
    });
  });

  xcontext('Update', () => {
    it('prevent un-authenticated user from updating a qualifying test', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user from updating a qualifying test', async () => {
      const db = await setup(mockUnverifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user with verified email from updating a qualifying test', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('prevent authenticated user with un-verified JAC email from updating a qualifying test', async () => {
      const db = await setup(mockUnverifiedJACUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('allow authenticated user with verified @judicialappointments.digital email to update a qualifying test', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qtr1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email to update a qualifying test', async () => {
      const db = await setup(mockVerifiedJACUser);
      await setupAdmin(db, mockData);
      await assertSucceeds(db.collection(COLLECTION_NAME).doc('qtr1').update({ type: 'critical_analysis', startDate: tomorrow, endDate: dayAfterTomorrow }));
    });
  });

  xcontext('Delete', () => {
    it('prevent un-authenticated user from deleting a qualifying test', async () => {
      const db = await setup();
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').delete());
    });
    it('prevent authenticated user from deleting someone elses assessment data', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').delete());
    });
    it('prevent authenticated user from deleting own assessment data', async () => {
      const db = await setup(mockVerifiedUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').delete());
    });
    it('prevent authenticated user with verified @judicialappointments.gov.uk email from deleting own assessment data', async () => {
      const db = await setup(mockVerifiedJACUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').delete());
    });
    it('prevent authenticated user with verified @judicialappointments.digital email from deleting own assessment data', async () => {
      const db = await setup(mockVerifiedJACDigitalUser);
      await setupAdmin(db, mockData);
      await assertFails(db.collection(COLLECTION_NAME).doc('qtr1').delete());
    });
  });

});

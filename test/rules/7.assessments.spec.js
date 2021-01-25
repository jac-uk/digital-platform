const { setup, teardown, setupAdmin, getTimeStamp } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('Assessments', () => {
  afterEach(async () => {
    await teardown();
  });

  const today = new Date();
  const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
  // const dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
  // const dayBeforeYesterday = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));

  context('Create', () => {
    it('prevent un-authenticated user from creating an assessment', async () => {
      const db = await setup();
      await assertFails(db.collection('assessments').add({ assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) }));
    });
    it('prevent authenticated user from creating an assessment', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await assertFails(db.collection('assessments').add({ assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) }));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading assessment data', async () => {
      const db = await setup();
      await setupAdmin(db, { 'assessments/assessment1': { userId: 'user1' } });
      await assertFails(db.collection('assessments').get());
    });

    it('prevent authenticated user from reading assessment data', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, { 'assessments/assessment1': { userId: 'user2' } });
      await assertFails(db.collection('assessments').get());
    });

    it('allow authenticated user to read assessments sent to them', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, { 'assessments/assessment1': { assessor: { email: 'user1@user1.user1' } } });
      await assertSucceeds(db.collection('assessments').where('assessor.email', '==', 'user1@user1.user1').get());
      await assertSucceeds(db.collection('assessments').doc('assessment1').get());
    });

    it('allow authenticated user to read assessments sent to them (upper case email in db)', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, { 'assessments/assessment1': { assessor: { email: 'User1@User1.user1' } } });
      await assertSucceeds(db.collection('assessments').where('assessor.email', '==', 'user1@user1.user1').get());
      await assertSucceeds(db.collection('assessments').doc('assessment1').get());
    });


    it('prevent authenticated user from reading anothers assessments', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, { 'assessments/assessment1': { assessor: { email: 'user2@user2.user2' } } });
      await assertFails(db.collection('assessments').where('assessor.email', '==', 'user2@user2.user2').get());
      await assertFails(db.collection('assessments').doc('assessment1').get());
    });

    it('allow JAC admin to list all assessments', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'assessments/assessment1': { assessor: { email: 'user1@user1.user1' } } }
      );
      await assertSucceeds(db.collection('applications').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating assessment data', async () => {
      const db = await setup();
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').update({ status: 'completed' }));
    });
    it('prevent authenticated user from updating someone elses assessment data', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user2@user2.user2' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').update({ status: 'completed' }));
    });
    it('allow authenticated user to update own assessment data', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertSucceeds(db.collection('assessments').doc('assessment1').update({ status: 'completed', 'assessor.id': 'user1' }));
    });
    it('prevent authenticated user from updating own assessment if they have already completed it', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'completed', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').update({ status: 'completed' }));
    });
    it('prevent authenticated user from updating own assessment to belong to another assessor ID', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').update({ status: 'completed', 'assessor.id': 'user2' }));
    });
    it('prevent authenticated user from updating own assessment to belong to another assessor email', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').update({ status: 'completed', 'assessor.email': 'user2@user2.user2' }));
    });
    it('prevent authenticated user from updating assessment after the due date', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(yesterday) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').update({ status: 'completed' }));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting an assessment', async () => {
      const db = await setup();
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').delete());
    });
    it('prevent authenticated user from deleting someone elses assessment data', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user2@user2.user2' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').delete());
    });
    it('prevent authenticated user from deleting own assessment data', async () => {
      const db = await setup({ uid: 'user1', email: 'user1@user1.user1', email_verified: true });
      await setupAdmin(db, {
        'assessments/assessment1': { assessor: { email: 'user1@user1.user1' }, status: 'pending', dueDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('assessments').doc('assessment1').delete());
    });
  });

});

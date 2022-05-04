const { setup, teardown } = require('./helpers');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

describe('QualifyingTestReports', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent JAC admin without permission from creating qualifyingTestReports', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('qualifyingTestReports').add({}));
    });

    it('allow JAC admin with permission to create qualifyingTestReports', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['qtrp2'] });
      await assertSucceeds(db.collection('qualifyingTestReports').add({}));
    });
  });

  context('Read', () => {
    it('prevent JAC admin without permission from reading qualifyingTestReports', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('qualifyingTestReports').get());
    });

    it('allow JAC admin with permission to read qualifyingTestReports', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['qtrp1'] });
      await assertSucceeds(db.collection('qualifyingTestReports').get());
    });
  });

  context('Update', () => {
    it('prevent JAC admin without permission from updating qualifyingTestReports', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'qualifyingTestReports/report1': {} }
      );
      await assertFails(db.collection('qualifyingTestReports').doc('report1').update({}));
    });

    it('allow JAC admin with permission to update qualifyingTestReports', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['qtrp3'] },
        { 'qualifyingTestReports/report1': {} }
      );
      await assertSucceeds(db.collection('qualifyingTestReports').doc('report1').update({}));
    });
  });

  context('Delete', () => {
    it('prevent JAC admin without permission from deleting qualifyingTestReports', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'qualifyingTestReports/report1': {} }
      );
      await assertFails(db.collection('qualifyingTestReports').doc('report1').delete());
    });

    it('allow JAC admin with permission to delete qualifyingTestReports', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: ['qtrp4'] },
        { 'qualifyingTestReports/report1': {} }
      );
      await assertSucceeds(db.collection('qualifyingTestReports').doc('report1').delete());
    });
  });

});

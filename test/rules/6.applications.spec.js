import { setup, teardown, getTimeStamp } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Applications', () => {
  afterEach(async () => {
    await teardown();
  });

  const today = new Date();
  const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
  const dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
  const dayBeforeYesterday = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));

  context('Create', () => {
    it('prevent un-authenticated user from creating an application', async () => {
      const db = await setup();
      await assertFails(db.collection('applications').add({}));
    });
    it('prevent authenticated user from creating a random application', async () => {
      const db = await setup({ uid: 'user1' });
      await assertFails(db.collection('applications').add({}));
    });
    it("prevent authenticated user from creating new application for an exercise that hasn't opened yet", async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'exercises/ex1': { applicationOpenDate: getTimeStamp(tomorrow), applicationCloseDate: getTimeStamp(dayAfterTomorrow) } }
      );
      await assertFails(db.collection('applications').add({ userId: 'user1', exerciseId: 'ex1', status: 'draft' }));
    });
    it('prevent authenticated user from creating new application for an exercise that has closed', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'exercises/ex1': { applicationOpenDate: getTimeStamp(dayBeforeYesterday), applicationCloseDate: getTimeStamp(yesterday) }}
      );
      await assertFails(db.collection('applications').add({ userId: 'user1', exerciseId: 'ex1', status: 'draft' }));
    });
    it('allow authenticated user to create new draft application for an open exercise', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'exercises/ex1': { applicationOpenDate: getTimeStamp(dayBeforeYesterday), applicationCloseDate: getTimeStamp(dayAfterTomorrow) } }
      );
      await assertSucceeds(db.collection('applications').add({ userId: 'user1', exerciseId: 'ex1', status: 'draft' }));
    });
    it("prevent authenticated user from creating an 'applied' application for an open exercise (i.e. can't apply straight away)", async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) } }
      );
      await assertFails(db.collection('applications').add({ userId: 'user1', exerciseId: 'ex1', status: 'applied' }));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading application data', async () => {
      const db = await setup(null, { 'applications/app1': { userId: 'user1' } });
      await assertFails(db.collection('applications').get());
    });

    it('prevent authenticated user from reading application data', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user2' } }
      );
      await assertFails(db.collection('applications').get());
    });

    it('allow authenticated user to read their own application data', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user1' } }
      );
      await assertSucceeds(db.collection('applications').where('userId', '==', 'user1').get());
    });

    it('prevent authenticated user from reading anothers application data', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user2' } }
      );
      await assertFails(db.collection('applications').where('userId', '==', 'user2').get());
    });

    it('prevent JAC admin without permission from listing all applications', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'applications/app1': { }, 'applications/app2': { } }
      );
      await assertFails(db.collection('applications').get());
    });

    it('allow JAC admin with permission to list all applications', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.applications.permissions.canReadApplications.value] },
        { 'applications/app1': { }, 'applications/app2': { } }
      );
      await assertSucceeds(db.collection('applications').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating application data', async () => {
      const db = await setup(null, {
        'applications/app1': { userId: 'user1', status: 'draft', exerciseId: 'ex1' },
        'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) },
      });
      await assertFails(db.collection('applications').doc('app1').update({}));
    });
    it('prevent authenticated user from updating someone elses application data', async () => {
      const db = await setup(
        { uid: 'user1' },
        {
          'applications/app1': { userId: 'user2', status: 'draft', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) },
        }
      );
      await assertFails(db.collection('applications').doc('app1').update({ userId: 'user1' }));
    });
    it('allow authenticated user to update own application data', async () => {
      const db = await setup(
        { uid: 'user1', email: 'test@test.com', email_verified:true },
        {
          'applications/app1': { userId: 'user1', status: 'draft', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) },
        }
      );
      await assertSucceeds(db.collection('applications').doc('app1').update({}));
    });
    it('prevent authenticated user from updating own application data to belong to someone else', async () => {
      const db = await setup(
        { uid: 'user1' },
        {
          'applications/app1': { userId: 'user1', status: 'draft', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) },
        }
      );
      await assertFails(db.collection('applications').doc('app1').update({ userId: 'user2' }));
    });
    it('prevent authenticated user from updating own application before exercise has opened', async () => {
      const db = await setup(
        { uid: 'user1' },
        {
          'applications/app1': { userId: 'user1', status: 'draft', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(tomorrow), applicationCloseDate: getTimeStamp(dayAfterTomorrow) },
        }
      );
      await assertFails(db.collection('applications').doc('app1').update({}));
    });
    it('prevent authenticated user from updating own application after exercise has closed', async () => {
      const db = await setup(
        { uid: 'user1' },
        {
          'applications/app1': { userId: 'user1', status: 'draft', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(dayBeforeYesterday), applicationCloseDate: getTimeStamp(yesterday) },
        }
      );
      await assertFails(db.collection('applications').doc('app1').update({}));
    });
    it('prevent authenticated user from updating own application after they have applied', async () => {
      const db = await setup(
        { uid: 'user1' },
        {
          'applications/app1': { userId: 'user1', status: 'applied', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) },
        }
      );
      await assertFails(db.collection('applications').doc('app1').update({}));
    });
    it('allow authenticated user to update own application after they have applied if the exercise requires more information', async () => {
      const db = await setup(
        { uid: 'user1' },
        {
          'applications/app1': { userId: 'user1', status: 'applied', exerciseId: 'ex1' },
          'exercises/ex1': {
            applicationOpenDate: getTimeStamp(dayBeforeYesterday),
            applicationCloseDate: getTimeStamp(yesterday),
            _applicationContent: {
              _currentStep: {
                step: 'selection',
              },
              selection: {
                personalDetails: true,
              },
            },
          },
        }
      );
      await assertSucceeds(db.collection('applications').doc('app1').update({}));
    });
    it('prevent authenticated user from updating own application after they have applied if the exercise requires more information for a different state', async () => {
      const db = await setup(
        { uid: 'user1' },
        {
          'applications/app1': { userId: 'user1', status: 'applied', exerciseId: 'ex1' },
          'exercises/ex1': {
            applicationOpenDate: getTimeStamp(dayBeforeYesterday),
            applicationCloseDate: getTimeStamp(yesterday),
            _applicationContent: {
              _currentStep: {
                step: 'selection',
              },
              shortlisting: {
                personalDetails: true,
              },
            },
          },
        }
      );
      await assertFails(db.collection('applications').doc('app1').update({}));
    });
    // TODO also check currentStep dates and application status
    it('allow authenticated user to update own application if it is in applied state to provide information for consent form', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user1', status: 'applied', characterChecks: { status: 'requested' }, exerciseId: 'ex1' } }
      );
      await assertSucceeds(db.collection('applications').doc('app1').update({characterChecks: {status: 'completed'}}));
    });
    it('allow authenticated user to update own application if it is in draft state to provide information for consent form', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user1', status: 'draft', characterChecks: { status: 'requested' }, exerciseId: 'ex1' } }
      );
      await assertSucceeds(db.collection('applications').doc('app1').update({characterChecks: {status: 'completed'}}));
    });
    it('dont allow authenticated user to update own application after they have applied if consent form was not requested', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user1', status: 'applied', characterChecks: { status: 'not requested' }, exerciseId: 'ex1' } }
      );
      await assertFails(db.collection('applications').doc('app1').update({characterChecks: {status: 'completed'}}));
    });
    it('dont allow authenticated user to update own application after they have applied if characterChecks property does not exist', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user1', status: 'applied', exerciseId: 'ex1' } }
      );
      await assertFails(db.collection('applications').doc('app1').update({characterChecks: {status: 'completed'}}));
    });


    it('prevent JAC admin without permission from updating applications', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        {
          'applications/app1': { userId: 'user2', status: 'draft', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) },
        }
      );
      await assertFails(db.collection('applications').doc('app1').update({ userId: 'user2' }));
    });

    it('allow JAC admin with permission to update applications', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.applications.permissions.canUpdateApplications.value] },
        {
          'applications/app1': { userId: 'user2', status: 'draft', exerciseId: 'ex1' },
          'exercises/ex1': { applicationOpenDate: getTimeStamp(yesterday), applicationCloseDate: getTimeStamp(tomorrow) },
        }
      );
      await assertSucceeds(db.collection('applications').doc('app1').update({ userId: 'user2' }));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting a application', async () => {
      const db = await setup(null, { 'applications/app1': { userId: 'user1' } });
      await assertFails(db.collection('applications').doc('app1').delete());
    });
    it('prevent authenticated user from deleting someone elses application data', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user2' } }
      );
      await assertFails(db.collection('applications').doc('app1').delete());
    });
    it('prevent authenticated user from deleting own application data', async () => {
      const db = await setup(
        { uid: 'user1' },
        { 'applications/app1': { userId: 'user1' } }
      );
      await assertFails(db.collection('applications').doc('app1').delete());
    });
  });

});

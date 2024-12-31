import { setup, teardown, getValidExerciseData } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { PERMISSIONS } from '../../functions/shared/permissions.js';

describe('Exercises', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    it('prevent un-authenticated user from creating an exercise', async () => {
      const db = await setup();
      await assertFails(db.collection('exercises').add(getValidExerciseData()));
    });

    it('prevent authenticated user from creating an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('exercises').add(getValidExerciseData()));
    });

    it('prevent authenticated user with verified email from creating an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('exercises').add(getValidExerciseData()));
    });

    it('prevent authenticated user with un-verified JAC email from creating an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('exercises').add(getValidExerciseData()));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to create an exercise with no data', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('exercises').add({}));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from creating an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('exercises').add(getValidExerciseData()));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from creating an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('exercises').add(getValidExerciseData()));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to create an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canCreateExercises.value] });
      await assertSucceeds(db.collection('exercises').add(getValidExerciseData()));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to create an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canCreateExercises.value] });
      await assertSucceeds(db.collection('exercises').add(getValidExerciseData()));
    });
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading exercises', async () => {
      const db = await setup();
      await assertFails(db.collection('exercises').get());
    });

    it('prevent authenticated user from reading exercises', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('exercises').get());
    });

    it('prevent authenticated user with verified email from reading exercises', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('exercises').get());
    });

    it('prevent authenticated user with un-verified JAC email from reading exercises', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('exercises').get());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from reading exercises', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('exercises').get());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from reading exercises', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('exercises').get());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to read exercises', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canReadExercises.value] });
      await assertSucceeds(db.collection('exercises').get());
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to read exercises', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canReadExercises.value] });
      await assertSucceeds(db.collection('exercises').get());
    });
  });

  context('Update', () => {
    it('prevent un-authenticated user from updating an exercise', async () => {
      const db = await setup(null, { 'exercises/ex1': { } });
      await assertFails(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('prevent authenticated user from updating an exercise', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: false },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('prevent authenticated user with verified email from updating an exercise', async () => {
      const db = await setup(
        {  uid: 'user1', email: 'user@email.com', email_verified: true },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('prevent authenticated user with un-verified JAC email from updating an exercise', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to update an exercise with missing data', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from updating an exercise', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from updating an exercise', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true },
        { 'exercises/ex1': { } }
      );
      await assertFails(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to update an exercise', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canUpdateExercises.value] },
        { 'exercises/ex1': { } }
      );
      await assertSucceeds(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to update an exercise', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canUpdateExercises.value] },
        { 'exercises/ex1': { } }
      );
      await assertSucceeds(db.collection('exercises').doc('ex1').update(getValidExerciseData()));
    });
  });

  context('Delete', () => {
    it('prevent un-authenticated user from deleting an exercise', async () => {
      const db = await setup();
      await assertFails(db.collection('exercises').doc('ex1').delete());
    });

    it('prevent authenticated user from deleting an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false });
      await assertFails(db.collection('exercises').doc('ex1').delete());
    });

    it('prevent authenticated user with verified email from deleting an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true });
      await assertFails(db.collection('exercises').doc('ex1').delete());
    });

    it('prevent authenticated user with un-verified JAC email from deleting an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false });
      await assertFails(db.collection('exercises').doc('ex1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from deleting an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true });
      await assertFails(db.collection('exercises').doc('ex1').delete());
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permisssion from deleting an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true });
      await assertFails(db.collection('exercises').doc('ex1').delete());
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to delete an exercise', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canDeleteExercises.value] });
      await assertSucceeds(db.collection('exercises').doc('ex1').delete());
    });
    
    it('prevent ready exercise from being deleted', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canDeleteExercises.value] },
        { 'exercises/ex1': { state: 'ready' } }
      );
      await assertFails(db.collection('exercises').doc('ex1').delete());
    });

    // @TODO: Add the data below to the failing tests above!
    it('allow draft exercise to be deleted', async () => {
      const db = await setup(
        { uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canDeleteExercises.value] },
        { 'exercises/ex1': { state: 'draft' } }
      );
      await assertSucceeds(db.collection('exercises').doc('ex1').delete());
    });
  });

  context('Write SCC summary reports', () => {
    
    it('prevent un-authenticated user from writing SCC summary report', async () => {
      const db = await setup({}, {'exercises/ex1': {}});
      await assertFails(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('prevent authenticated user from writing SCC summary report', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: false }, {'exercises/ex1': {}});
      await assertFails(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('prevent authenticated user with verified email from writing SCC summary report', async () => {
      const db = await setup({ uid: 'user1', email: 'user@email.com', email_verified: true }, {'exercises/ex1': {}});
      await assertFails(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('prevent authenticated user with un-verified JAC email from writing SCC summary report', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: false }, {'exercises/ex1': {}});
      await assertFails(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('prevent authenticated user with verified @judicialappointments.digital email to write SCC summary report with no data', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true }, {'exercises/ex1': {}});
      await assertFails(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('prevent authenticated user with verified @judicialappointments.digital email but without permission from writing SCC summary report', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true }, {'exercises/ex1': {}});
      await assertFails(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('prevent authenticated user with verified @judicialappointments.gov.uk email but without permission from writing SCC summary report', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true }, {'exercises/ex1': {}});
      await assertFails(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('allow authenticated user with verified @judicialappointments.digital email and permission to write SCC summary report', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.digital', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canUpdateExercises.value] }, {'exercises/ex1': {}});
      await assertSucceeds(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });

    it('allow authenticated user with verified @judicialappointments.gov.uk email and permission to write SCC summary report', async () => {
      const db = await setup({ uid: 'user1', email: 'user@judicialappointments.gov.uk', email_verified: true, rp: [PERMISSIONS.exercises.permissions.canUpdateExercises.value] }, {'exercises/ex1': {}});
      await assertSucceeds(
        db.collection('exercises').doc('ex1').collection('reports').doc('sccSummary').set({})
      );
    });
  });
});

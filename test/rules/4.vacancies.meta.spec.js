import { setup, teardown } from './helpers.js';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

describe('Meta', () => {
  afterEach(async () => {
    await teardown();
  });

  context('Create', () => {
    // @todo
  });

  context('Read', () => {
    it('prevent un-authenticated user from reading vacancy stats', async () => {
      const db = await setup(
        null,
        { 'vacancies/vac1': {
            name: 'vac 1',
            'meta/stats': { applicationsCount: 5 },
          },
        }
      );
      await assertFails(db.doc('vacancies/vac1/meta/stats').get());
    });
    it('allow authenticated user to read vacancy stats', async () => {
      const db = await setup(
        { uid: 'bob' },
        { 'vacancies/vac1': {
            name: 'vac 1',
            'meta/stats': { applicationsCount: 5 },
          },
        }
      );
      await assertSucceeds(db.doc('vacancies/vac1/meta/stats').get());
    });
  });

  context('Update', () => {
    // @todo
  });

  context('Delete', () => {
    // @todo
  });



});

import vacancy from '@/store/vacancy';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import sanitizeFirestore from '@/utils/sanitizeFirestore';
jest.mock('@/utils/sanitizeFirestore');

describe('store/vacancy', () => {
  const mutations = vacancy.mutations;
  const actions = vacancy.actions;
  const getters = vacancy.getters;
  let state;
  beforeEach(() => {
    state = {
      data: {},
      id: null,
    };
  });

  describe('mutations', () => {
    describe('setVacancy', () => {
      it('stores the supplied data in the state', () => {
        const data = {title: 'Example Vacancy Title'};
        mutations.setVacancy(state, data);
        expect(state.data).toBe(data);
      });
    });

    describe('setVacancyId', () => {
      it('stores the supplied data in the state', () => {
        const id = 'hsQqdvAfZpSw94X2B8nA';
        vacancy.mutations.setVacancyId(state, id);
        expect(state.id).toBe(id);
      });
    });
  });

  describe('actions', () => {
    let context;
    let docBackup;
    beforeEach(() => {
      context = {
        commit: jest.fn(),
        getters,
        state,
      };
      docBackup = getters.vacancyDoc;
    });

    afterEach(() => {
      getters.vacancyDoc = docBackup;
    });

    describe('loadVacancy', () => {
      it('throws an error if vacancy ID has not been set', async () => {
        await expect(actions.loadVacancy(context)).rejects.toThrowError('set the Vacancy ID first');
      });

      it('gets the vacancy data, sanitizes it, and commits it to the state', async () => {
        const data = {title: 'Example Vacancy Title'};
        const sanitizedData = {title: 'Example Vacancy Title', sanitized: true};
        const snapshot = {
          data: jest.fn().mockReturnValue(data)
        };
        getters.vacancyDoc = {
          get: jest.fn().mockResolvedValue(snapshot)
        };

        state.id = 'hsQqdvAfZpSw94X2B8nA';
        await actions.loadVacancy(context);

        expect(snapshot.data).toHaveBeenCalled();
        expect(sanitizeFirestore).toHaveBeenCalledWith(data);
        expect(context.commit).toHaveBeenCalledWith('setVacancy', sanitizedData);
      });
    });
  });

  describe('getters', () => {
    describe('vacancy', () => {
      it('returns the vacancy data object from state', () => {
        const data = {title: 'Example Vacancy Title'};
        state.data = data;
        expect(getters.vacancy(state)).toBe(data);
      });
    });

    describe('vacancyDoc', () => {
      it('returns null when vacancy ID is not set', () => {
        expect(getters.vacancyDoc(state)).toBe(null);
      });
      it('returns a Firestore DocumentReference object', () => {
        state.id = 'hsQqdvAfZpSw94X2B8nA';
        const doc = getters.vacancyDoc(state);
        expect(doc).toBeInstanceOf(firebase.firestore.DocumentReference);
      });
      it('the document path matches vacancies/{vacancyId}', () => {
        state.id = 'hsQqdvAfZpSw94X2B8nA';
        const doc = getters.vacancyDoc(state);
        expect(doc.id).toBe('hsQqdvAfZpSw94X2B8nA');
        expect(doc.path).toBe('vacancies/hsQqdvAfZpSw94X2B8nA');
      });
    });
  });
});

import applicant from '@/store/applicant';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import sanitizeFirestore from '@/utils/sanitizeFirestore';
jest.mock('@/utils/sanitizeFirestore');

describe('store/applicant', () => {
  const mutations = applicant.mutations;
  const actions = applicant.actions;
  const getters = applicant.getters;
  let state;
  beforeEach(() => {
    state = {
      data: {},
    };
  });

  describe('mutations', () => {
    describe('setApplicant', () => {
      it('stores the supplied data in the state', () => {
        const data = {name: 'John Smith'};
        mutations.setApplicant(state, data);
        expect(state.data).toBe(data);
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
      docBackup = getters.applicantDoc;
    });

    afterEach(() => {
      getters.applicantDoc = docBackup;
    });

    describe('loadApplicant', () => {
      it('gets the applicant data, sanitizes it, and commits it to the state', async () => {
        const data = {name: 'John Smith'};
        const sanitizedData = {name: 'John Smith', sanitized: true};
        const snapshot = {
          data: jest.fn().mockReturnValue(data)
        };
        getters.applicantDoc = {
          get: jest.fn().mockResolvedValue(snapshot)
        };

        await actions.loadApplicant(context);

        expect(snapshot.data).toHaveBeenCalled();
        expect(sanitizeFirestore).toHaveBeenCalledWith(data);
        expect(context.commit).toHaveBeenCalledWith('setApplicant', sanitizedData);
      });
    });

    describe('saveApplicant', () => {
      const data = {name: 'John Smith'};

      beforeEach(() => {
        getters.applicantDoc = {
          set: jest.fn().mockResolvedValue()
        };
      });

      it('saves the data to Firestore', async () => {
        await actions.saveApplicant(context, data);
        expect(getters.applicantDoc.set).toHaveBeenCalledTimes(1);
        expect(getters.applicantDoc.set).toHaveBeenCalledWith(data);
      });

      it('commits a clone of the data to the state', async () => {
        await actions.saveApplicant(context, data);
        expect(context.commit).toHaveBeenCalledTimes(1);
        expect(context.commit).toHaveBeenCalledWith('setApplicant', data);

        // Check that the committed object *IS NOT* the same as that which was passed to the saveApplicant method
        // A clone is committed to avoid accidental 'pass by reference' changes to state data
        const committedData = context.commit.mock.calls[0][1];
        expect(committedData).not.toBe(data);
        expect(committedData).toEqual(data);
      });
    });
  });

  describe('getters', () => {
    describe('applicant()', () => {
      beforeEach(() => {
        state.data = {name: 'John Smith'};
      });

      it('is a function (so vuex does not cache output)', () => {
        expect(getters.applicant(state)).toBeInstanceOf(Function);
      });

      it('returns a clone of the applicant data (rather than a reference to the state object)', () => {
        const applicant = getters.applicant(state)();
        expect(applicant).not.toBe(state.data);
        expect(applicant).toEqual(state.data);
      });
    });

    describe('applicantDoc', () => {
      it('returns null if getters.currentUserId returns null', () => {
        getters.currentUserId = null;
        const doc = getters.applicantDoc(state, getters);
        expect(doc).toBe(null);
      });
      it('returns a Firestore DocumentReference object', () => {
        getters.currentUserId = '4jsbvO27RJYqSRsgZM9sPhDFLDU2';
        const doc = getters.applicantDoc(state, getters);
        expect(doc).toBeInstanceOf(firebase.firestore.DocumentReference);
      });
      it('the document path matches applicants/{currentUserId}', () => {
        getters.currentUserId = '4jsbvO27RJYqSRsgZM9sPhDFLDU2';
        const doc = getters.applicantDoc(state, getters);
        expect(doc.id).toBe('4jsbvO27RJYqSRsgZM9sPhDFLDU2');
        expect(doc.path).toBe('applicants/4jsbvO27RJYqSRsgZM9sPhDFLDU2');
      });
    });
  });
});

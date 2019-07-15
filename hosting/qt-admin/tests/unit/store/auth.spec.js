import auth from '@/store/auth';

describe('store/auth', () => {
  const mutations = auth.mutations;
  const actions = auth.actions;
  const getters = auth.getters;
  let state;
  beforeEach(() => {
    state = {
      currentUser: null,
    };
  });

  // test mutations
  describe('mutations', () => {

    describe('setCurrentUser', () => {
      it('sets `currentUser` in the state', () => {
        const data = {uid: "12345", email: "test@test.com"};
        mutations.setCurrentUser(state, data);
        expect(state.currentUser).toBe(data);
      });
    });

  });

  // test actions
  describe('actions', () => {
    let context;

    beforeEach(() => {
      context = {
        commit: jest.fn(),
        getters,
        state,
      };
    });

    describe('setCurrentUser', () => {

      describe('when user is not signed in', () => {
        it('should run `setCurrentUser` mutation with `null`', () => {
          actions.setCurrentUser(context, null);
          expect(context.commit).toHaveBeenCalledWith('setCurrentUser', null);
        });
      });

      describe('when user is signed in', () => {
        it('should run `setCurrentUser` mutation with data from the user object', () => {
          const user = {
            uid: 'abc123',
            email: 'test@test.com',
            something: "test"
          };

          const expectedState = {
            uid: 'abc123',
            email: 'test@test.com'
          };

          actions.setCurrentUser(context, user);
          expect(context.commit).toHaveBeenCalledWith('setCurrentUser', expectedState);
        });
      });
    });
  });

  // test getters
  describe('getters', () => {

    describe('isSignedIn', () => {

      describe('given a user is not signed in', () => {
        it('should return false', () => {
          expect(getters.isSignedIn(state)).toBe(false);
        });
      });

      describe('given a user is signed in', () => {
        it('should return true', () => {
          state.currentUser = {
            uid: 'abc123',
            email: 'test@test.com'
          };
          expect(getters.isSignedIn(state)).toBe(true);
        });
      });
    });

    describe('emailDomainIsValid', () => {

      describe('if a user is not signed in', () => {
        it('should return null', () => {
          expect(getters.emailDomainIsValid(state)).toBe(null);
        });
      });

      describe('if the user is signed in but has the wrong email domain', () => {
        it('should return false', () => {
          state.currentUser = {
            uid: 'abc123',
            email: 'test@test.com'
          };
          expect(getters.emailDomainIsValid(state)).toBe(false);
        });
      });

      describe('if the user is signed in and email domain is equal to judicialappointments.digital', () => {
        it('should return true', () => {
          state.currentUser = {
            uid: 'abc123',
            email: 'test@judicialappointments.digital'
          };

          expect(getters.emailDomainIsValid(state)).toBe(true);
        });
      });
    });
  });
});

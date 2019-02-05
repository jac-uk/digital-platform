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

  describe('mutations', () => {
    describe('setCurrentUser', () => {
      it('sets `currentUser` in the state', () => {
        const data = {uid: 'abc123', email: 'user@example.com'};
        mutations.setCurrentUser(state, data);
        expect(state.currentUser).toBe(data);
      });
    });
  });

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
      describe('user is `null` (user is not logged in)', () => {
        it('runs `setCurrentUser` mutation with `null`', () => {
          actions.setCurrentUser(context, null);
          expect(context.commit).toHaveBeenCalledWith('setCurrentUser', null);
        });
      });
      describe('user object is supplied (user is logged in)', () => {
        it('runs `setCurrentUser` mutation with data from the user object', () => {
          const user = {
            uid: 'abc123',
            displayName: null,
            photoURL: null,
            email: 'user@example.com',
            emailVerified: true,
            phoneNumber: null,
            isAnonymous: false,
          };

          const expectedState = {
            uid: 'abc123',
            email: 'user@example.com',
            emailVerified: true,
          };

          actions.setCurrentUser(context, user);
          expect(context.commit).toHaveBeenCalledWith('setCurrentUser', expectedState);
        });
      });
    });
  });

  describe('getters', () => {
    describe('isLoggedIn', () => {
      describe('currentUser is `null`', () => {
        it('returns false', () => {
          state.currentUser = null;
          expect(getters.isLoggedIn(state)).toBe(false);
        });
      });
      describe('currentUser is set', () => {
        it('returns true', () => {
          state.currentUser = {
            uid: 'abc123',
            email: 'user@example.com',
            emailVerified: true,
          };
          expect(getters.isLoggedIn(state)).toBe(true);
        });
      });
    });

    describe('currentUserId', () => {
      describe('user is not logged in', () => {
        it('returns null', () => {
          state.currentUser = null;
          expect(getters.currentUserId(state)).toBe(null);
        });
      });
      describe('user is logged in', () => {
        it("returns the user's ID", () => {
          state.currentUser = {
            uid: 'abc123',
            email: 'user@example.com',
            emailVerified: true,
          };
          expect(getters.currentUserId(state)).toBe('abc123');
        });
      });
    });
  });
});

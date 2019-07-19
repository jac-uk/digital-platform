import {shallowMount} from '@vue/test-utils';
import SignIn from '@/views/SignIn';
import FirebaseUI from '@/components/FirebaseUI';

describe('SignIn view', () => {
  const createTestSubject = () => {
    return shallowMount(SignIn);
  };

  let wrapper;

  beforeEach(() => {
    wrapper = createTestSubject();
  });

  it('renders FirebaseUI component', () => {
    expect(wrapper.find(FirebaseUI).exists()).toBe(true);
  });

  describe('when FirebaseUI emits a signInSuccess', () => {
    const authResult = {
      additionalUserInfo: {},
      credential: null,
      operationType: 'signIn',
      user: {},
    };

    beforeEach(() => {
      wrapper.vm.$router = {
        push: jest.fn(),
      };

      wrapper.vm.$store = {
        dispatch: jest.fn(),
      };

      wrapper.find(FirebaseUI).vm.$emit('signInSuccess', authResult);
    });

    it('updates the store with the authenticated user object', () => {
      expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('setCurrentUser', authResult.user);
    });

    it('redirects to the homepage', () => {
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/');
    });
  });
});


import { shallowMount } from '@vue/test-utils';
import FirebaseUI from '@/components/FirebaseUI';

const mockFirebaseAuth = jest.fn();

import {auth} from '@/firebase';
jest.mock('@/firebase', () => {
  const mock = {
    auth: jest.fn(() => (mockFirebaseAuth))
  };
  mock.auth.EmailAuthProvider = {
    PROVIDER_ID: 'email'
  };
  return mock;
});

const mockUiInstance = {
  start: jest.fn(),
  delete: jest.fn()
};

import firebaseui from 'firebaseui';
jest.mock('firebaseui', () => {
  return {
    auth: {
      AuthUI: jest.fn(auth => mockUiInstance),
      CredentialHelper: {
        NONE: 'none'
      }
    }
  };
});

describe('FirebaseUI component', () => {
  const createTestSubject = () => {
    jest.clearAllMocks();
    return shallowMount(FirebaseUI);
  };

  describe('start FirebaseUI when the component is mounted', () => {
    const wrapper = createTestSubject();

    it('creates a DOM element "#firebaseui-auth-container"', () => {
      expect(wrapper.find('#firebaseui-auth-container').exists()).toBe(true);
    });

    it('creates a FirebaseUI instance bound to the Firebase Auth instance', () => {
      expect(firebaseui.auth.AuthUI).toHaveBeenCalledWith(mockFirebaseAuth);
      expect(wrapper.vm.ui).toBe(mockUiInstance);
    });

    it('starts FirebaseUI', () => {
      expect(mockUiInstance.start).toHaveBeenCalledTimes(1);
      expect(mockUiInstance.start).toHaveBeenCalledWith(
        '#firebaseui-auth-container',
        wrapper.vm.uiConfig
      );
    });
  });

  it('starts FirebaseUI with the expected config', () => {
    const wrapper = createTestSubject();
    const config = wrapper.vm.uiConfig;

    expect(config).toEqual({
      signInOptions: [
        {
          provider: auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false
        }
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      callbacks: {
        signInSuccessWithAuthResult: wrapper.vm.returnFalse
      }
    });
  });

  it('has a method which returns false', () => {
    const wrapper = createTestSubject();
    expect(wrapper.vm.returnFalse()).toBe(false);
  });

  it('destroys the FirebaseUI instance when the component is destroyed', () => {
    const wrapper = createTestSubject();
    wrapper.destroy();
    expect(mockUiInstance.delete).toBeCalledTimes(1);
  });
});

import {shallowMount} from "@vue/test-utils";
import Login from '@/views/Login';
import FirebaseUI from '@/components/FirebaseUI';

describe('Login view', () => {
  const createTestSubject = () => {
    return shallowMount(Login);
  };

  let wrapper;
  beforeEach(() => {
    wrapper = createTestSubject();
  });

  it('renders a `FirebaseUI` component', () => {
    expect(wrapper.find(FirebaseUI).exists()).toBe(true);
  });
});

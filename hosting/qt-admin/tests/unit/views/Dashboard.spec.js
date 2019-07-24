import {shallowMount} from '@vue/test-utils';
import Dashboard from '@/views/Dashboard';

describe('Dashboard view', () => {
  const createTestSubject = () => {
    return shallowMount(Dashboard);
  };

  let wrapper;

  beforeEach(() => {
    wrapper = createTestSubject();
  });

  it('renders component', () => {
    expect(wrapper.find(Dashboard).exists()).toBe(true);
  });

  it('contains sign out button', () => {
    expect(wrapper.contains('button#sign-out')).toBe(true);
  });

  it('calls signOut methods', () => {
    wrapper.setMethods({ signOut: jest.fn() });
    wrapper.find('button#sign-out').trigger('click');

    expect(wrapper.vm.signOut).toHaveBeenCalledTimes(1);
  });
});


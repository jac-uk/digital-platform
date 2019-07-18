import {shallowMount} from '@vue/test-utils';
import InvalidDomain from '@/views/InvalidDomain';

describe('InvalidDomain view', () => {
  const createTestSubject = () => {
    return shallowMount(InvalidDomain);
  };

  let wrapper;

  beforeEach(() => {
    wrapper = createTestSubject();
  });

  it('renders component', () => {
    expect(wrapper.find(InvalidDomain).exists()).toBe(true);
  });
});


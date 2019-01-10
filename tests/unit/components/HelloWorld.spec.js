import { shallowMount } from '@vue/test-utils';
import HelloWorld from '@/components/HelloWorld.vue';

describe('HelloWorld.vue', () => {
  const msg = 'new message';
  const wrapper = shallowMount(HelloWorld, {
    propsData: { msg }
  });

  it('renders props.msg when passed', () => {
    expect(wrapper.text()).toMatch(msg);
  });

  it('runs a dummy method', () => {
    expect(wrapper.vm.dummy()).toBe('I only exist to enable test coverage');
  });
});

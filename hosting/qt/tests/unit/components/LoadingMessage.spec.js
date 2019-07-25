import {shallowMount} from '@vue/test-utils';
import LoadingMessage from '@/components/LoadingMessage';

describe('components/IEWarning', () => {
  it('shows the "Loading" message if loadfailed is equal to false', () => {
    const wrapper = shallowMount(LoadingMessage, {
      propsData: {
        loadfailed: false,
      },
    });

    expect(wrapper.find({ ref: 'loadingMessage', }).isVisible()).toBe(true);
    expect(wrapper.find({ ref: 'errorMessage', }).exists()).toBe(false);
  });

  it('shows the errorMessage message if loadfailed is equal to true', () => {
    const wrapper = shallowMount(LoadingMessage, {
      propsData: {
        loadfailed: true,
      },
    });

    expect(wrapper.find({ ref: 'errorMessage', }).isVisible()).toBe(true);
    expect(wrapper.find({ ref: 'loadingMessage', }).exists()).toBe(false);
  });
});

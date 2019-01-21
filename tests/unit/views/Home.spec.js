import {shallowMount} from "@vue/test-utils";
import Home from '@/views/Home';
import ApplicationForm from '@/components/ApplicationForm';

describe('Home view', () => {
  const createTestSubject = () => {
    return shallowMount(Home, {
      propsData: {
        authUser: {
          uid: '4jsbvO27RJYqSRsgZM9sPhDFLDU2'
        }
      }
    });
  };

  let wrapper;
  beforeEach(() => {
    wrapper = createTestSubject();
  });

  it('renders an `ApplicationForm` component', () => {
    expect(wrapper.find(ApplicationForm).exists()).toBe(true);
  });

  it('passes the auth user ID to `ApplicationForm` component', () => {
    expect(wrapper.find(ApplicationForm).props('userId')).toEqual('4jsbvO27RJYqSRsgZM9sPhDFLDU2');
    expect(wrapper.find(ApplicationForm).props('userId')).toEqual(wrapper.props('authUser').uid);
  });
});

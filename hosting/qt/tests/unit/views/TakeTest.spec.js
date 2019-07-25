import Vuex from 'vuex';
import {shallowMount, createLocalVue} from '@vue/test-utils';
import TakeTest from '@/views/TakeTest';
// import loadTestData from '@/utils/helpers/loadTestData';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('TakeTest view', () => {
  let store, getters;

  describe('when testFormUrl is available from getters', () => {
    beforeEach(() => {
      getters = {
        testFormUrl: jest.fn().mockImplementation(() => 'url'),
      };
      store = new Vuex.Store({
        getters,
      });  
    });

    it('renders an iframe', () => {
      const wrapper = shallowMount(TakeTest, {
        store,
        localVue,
      });
      expect(wrapper.find('iframe').exists()).toBe(true);
    });

    it('does not render LoadingMessage component', () => {
      const wrapper = shallowMount(TakeTest, {
        store,
        localVue,
      });
      expect(wrapper.find({ref: 'loadingMessage'}).exists()).toBe(false);
      expect(wrapper.find({ref: 'errorMessage'}).exists()).toBe(false);
    });
  });

  describe('when testFormUrl is not available from getters', () => {
    beforeEach(() => {
      getters = {
        testFormUrl: jest.fn().mockImplementation(() => undefined),
      };
      store = new Vuex.Store({
        getters,
      });  
    });

    it('renders iframe as a result of loading test data', () => {
      const wrapper = shallowMount(TakeTest, {
        store,
        localVue,
      });

      expect(wrapper.find('iframe').exists()).toBe(true);
    });
  });

  describe('asks confirmation if user wants to leave the page', () => {
    beforeEach(() => {
      getters = {
        testFormUrl: jest.fn().mockImplementation(() => 'url'),
      },
      store = new Vuex.Store({
        getters,
      });  
    });

    it('runs loadTestData function', () => {
      const wrapper = shallowMount(TakeTest, {
        store,
        localVue,
      });

      global.confirm = jest.fn();
      
      wrapper.find('#goBack-btn').trigger('click');
      expect(window.confirm).toHaveBeenCalled();
    });
  });
});

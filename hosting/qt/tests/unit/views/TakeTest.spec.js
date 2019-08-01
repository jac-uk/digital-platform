import Vue from 'vue';
import Vuex from 'vuex';
import {shallowMount, createLocalVue} from '@vue/test-utils';
import TakeTest from '@/views/TakeTest';
import loadTestData from '@/helpers/loadTestData';
import VueRouter from 'vue-router';

jest.mock('@/helpers/loadTestData', () => {
  return jest.fn().mockResolvedValue();
});

const localVue = createLocalVue();
localVue.use(Vuex);

let store, getters;

describe('TakeTest view', () => {
  describe('when user can take the test', () => {
    beforeEach(() => {
      getters = {
        testFormUrl: jest.fn().mockImplementation(() => 'url'),
        testIsOpen: jest.fn().mockImplementation(() => true),
        userHasStartedTest: jest.fn().mockImplementation(() => true),
        userHasFinishedTest: jest.fn().mockImplementation(() => false),
      };
      store = new Vuex.Store({
        getters,
      });  
    });


    it('calls loadTestData function', () => {
      shallowMount(TakeTest, {
        store,
        localVue,
      });

      expect(loadTestData).toHaveBeenCalled();
    });

    it('renders iframe', (done) => {
      const wrapper = shallowMount(TakeTest, {
        store,
        localVue,
      });

       Vue.nextTick(() => {
        expect(wrapper.find('iframe').exists()).toBe(true);
        done();
      });
    });    
  });

  describe('when user can take the test but test load is failed', () => {
    beforeEach(() => {
      getters = {
        testFormUrl: jest.fn().mockImplementation(() => 'url'),
        testIsOpen: jest.fn().mockImplementation(() => true),
        userHasStartedTest: jest.fn().mockImplementation(() => true),
        userHasFinishedTest: jest.fn().mockImplementation(() => false),
      };
      store = new Vuex.Store({
        getters,
      });  
    });

    it('renders loadingMessage component', () => {
     const wrapper = shallowMount(TakeTest, {
        store,
        localVue,
      });

      wrapper.setData({ loaded: false, loadFailed: false });
      expect(wrapper.find({ref: 'loadingMessageComponent'}).exists()).toBe(true);
    });
  });

  describe('when user can not take the test', () => {
    beforeEach(() => {
      localVue.use(VueRouter);
      localVue.use(Vuex);

      getters = {
        testFormUrl: jest.fn().mockImplementation(() => 'url'),
        testIsOpen: jest.fn().mockImplementation(() => true),
        userHasStartedTest: jest.fn().mockImplementation(() => true),
        userHasFinishedTest: jest.fn().mockImplementation(() => true),
      };
      store = new Vuex.Store({
        getters,
      });  
    });

    it('redirects user to the previous page', (done) => {
      const router = {
        init: jest.fn(),
        push: jest.fn(),
        history: {},
      };

      const wrapper = shallowMount(TakeTest, {
        localVue,
        store,
        router,
      });

      wrapper.vm.$nextTick(() => {
        expect(router.push).toHaveBeenCalledWith({name: 'Test'});
        done();
      });
    });
  });
});

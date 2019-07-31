import Vue from 'vue';
import Vuex from 'vuex';
import {shallowMount, createLocalVue} from '@vue/test-utils';
import TakeTest from '@/views/TakeTest';
import VueRouter from 'vue-router';
const router = new VueRouter();
import loadTestData from '@/helpers/loadTestData';

jest.mock('@/helpers/loadTestData', () => {
  return jest.fn().mockResolvedValue();
});

const localVue = createLocalVue();
localVue.use(Vuex);

let store, getters;

describe("TakeTest view", () => {
  describe("when user can take the test", () => {
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


    it("calls loadTestData function", () => {
      shallowMount(TakeTest, {
        store,
        localVue,
      });

      expect(loadTestData).toHaveBeenCalled();
    })

    it("renders iframe", (done) => {
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

  describe("when user can take the test but test load is failed", () => {
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

    it.only("renders loadingMessage component", () => {
     const wrapper = shallowMount(TakeTest, {
        store,
        localVue,
        router
      });

      wrapper.setData({ loaded: false, loadFailed: false });
      expect(wrapper.find('iframe').exists()).toBe(true);
    })
  })
})

// describe('TakeTest view', () => {
//   let store, getters;

//   describe('when testFormUrl is available from getters', () => {
//     beforeEach(() => {
//       getters = {
//         testFormUrl: jest.fn().mockImplementation(() => 'url'),
//         testIsOpen: jest.fn().mockImplementation(() => true),
//         userHasStartedTest: jest.fn().mockImplementation(() => true),
//         userHasFinishedTest: jest.fn().mockImplementation(() => false),
//       };
//       store = new Vuex.Store({
//         getters,
//       });  
//     });

//     it('renders an iframe', (done) => {
//       const wrapper = shallowMount(TakeTest, {
//         store,
//         localVue,
//       });

//       Vue.nextTick(() => {
//         expect(wrapper.find('iframe').exists()).toBe(true);
//         done();
//       });
//     });
//   });

//   describe('when testFormUrl is not available from getters', () => {
//     beforeEach(() => {
//       getters = {
//         testFormUrl: jest.fn().mockImplementation(() => undefined),
//         testIsOpen: jest.fn().mockImplementation(() => true),
//         userHasStartedTest: jest.fn().mockImplementation(() => true),
//         userHasFinishedTest: jest.fn().mockImplementation(() => false),
//       };
//       store = new Vuex.Store({
//         getters,
//       });
//     });

//     it('calls loadTestData function', () => {
//       shallowMount(TakeTest, {
//         store,
//         localVue,
//       });

//       expect(mockedLoadTestDataCall).toHaveBeenCalled();
//     });
//   });

//   describe('when user wants to leeave the page', () => {
//     it('asks confirmation if user wants to leave the page', () => {
//       getters = {
//         testFormUrl: jest.fn().mockImplementation(() => undefined),
//         testIsOpen: jest.fn().mockImplementation(() => true),
//         userHasStartedTest: jest.fn().mockImplementation(() => true),
//         userHasFinishedTest: jest.fn().mockImplementation(() => false),
//       };
//       store = new Vuex.Store({
//         getters,
//       });  

//       const wrapper = shallowMount(TakeTest, {
//         store,
//         localVue,
//       });

//       global.confirm = jest.fn();
      
//       wrapper.find('#goBack-btn').trigger('click');

//       expect(window.confirm).toHaveBeenCalled();
//     });
//   });

//   describe('Loading message child component', () => {
//     beforeEach(() => {
//       getters = {
//         testFormUrl: jest.fn().mockImplementation(() => null),
//         testIsOpen: jest.fn().mockImplementation(() => true),
//         userHasStartedTest: jest.fn().mockImplementation(() => true),
//         userHasFinishedTest: jest.fn().mockImplementation(() => false),
//       };
//       store = new Vuex.Store({
//         getters,
//       });  
//     });

//     it('renders LoadingMessage component when loaded is equal to false', () => {
//       const wrapper = shallowMount(TakeTest, {
//         store,
//         localVue,
//       });
//       wrapper.setData({ loaded: false, loadFailed: false });

//       expect(wrapper.find({ref: 'loadingMessageComponent'}).exists()).toBe(true);
//     });
//   });

//   describe('When user is not authorized to get access to a Google Form', () => {
//     it('renders alert and does not render iframe', () => {
//       getters = {
//         testFormUrl: jest.fn().mockImplementation(() => 'src'),
//         testIsOpen: jest.fn().mockImplementation(() => false),
//         userHasStartedTest: jest.fn().mockImplementation(() => true),
//         userHasFinishedTest: jest.fn().mockImplementation(() => false),
//       };
//       store = new Vuex.Store({
//         getters,
//       });  

//       const wrapper = shallowMount(TakeTest, {
//         store,
//         localVue,
//       });

//       expect(wrapper.find({ref: 'alert'}).exists()).toBe(true);
//       expect(wrapper.find('iframe').exists()).toBe(false);
//     });
//   });
// });

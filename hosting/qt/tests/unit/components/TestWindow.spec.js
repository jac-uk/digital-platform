import {shallowMount, createLocalVue} from '@vue/test-utils';
import Vuex from 'vuex';
import TestWindow from '@/components/TestWindow';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('components/TestWindow', () => {
  const createTestSubject = (mockGetters) => {
    const defaultMockGetters = {
      test: () => ({
        openingTime: new Date(),
        closingTime: new Date(),
      }),
      testHasOpened: () => false,
      testHasClosed: () => false,
      testIsOpen:    () => false,
    };
    const store = new Vuex.Store({
      getters: {
        ...defaultMockGetters,
        ...mockGetters
      },
    });
    return shallowMount(TestWindow, {localVue, store});
  };

  let subject;

  it('renders in a HTML <div> tag', () => {
    subject = createTestSubject({});
    expect(subject.is('div')).toBe(true);
  });

  describe('before test day', () => {
    beforeEach(() => {
      const mockGetters = {
        test: () => ({
          openingTime: new Date('2050-06-17 07:00:00'),
          closingTime: new Date('2050-06-17 21:00:00'),
        }),
        testHasOpened: () => false,
        testHasClosed: () => false,
        testIsOpen:    () => false,
      };
      subject = createTestSubject(mockGetters);
    });

    it('starts with "The test window will be open on"', () => {
      expect(subject.text()).toStartWith('The test window will be open on');
    });

    it('shows the date of the test', () => {
      expect(subject.text()).toContain('17 June 2050');
    });

    it('shows the opening and closing times', () => {
      expect(subject.text()).toContain('between 7am and 9pm');
    });
  });

  describe('on test day', () => {
    describe('before the test window has opened', () => {
      // TODO: Impement tests
      it.skip('', () => {});
    });

    describe('when the test window is open', () => {
      // TODO: Impement tests
      it.skip('', () => {});
    });

    describe('after the test window has closed', () => {
      // TODO: Impement tests
      it.skip('', () => {});
    });
  });

  describe('after test day', () => {
    beforeEach(() => {
      const mockGetters = {
        test: () => ({
          openingTime: new Date('2000-02-05 09:00:00'),
          closingTime: new Date('2000-02-05 17:00:00'),
        }),
        testHasOpened: () => true,
        testHasClosed: () => true,
        testIsOpen:    () => false,
      };
      subject = createTestSubject(mockGetters);
    });

    it('starts with "This test has closed."', () => {
      expect(subject.text()).toStartWith('This test has closed.');
    });

    it('shows the date of the test', () => {
      expect(subject.text()).toContain('5 February 2000');
    });

    it('shows the opening and closing times', () => {
      expect(subject.text()).toContain('between 9am and 5pm');
    });
  });
});

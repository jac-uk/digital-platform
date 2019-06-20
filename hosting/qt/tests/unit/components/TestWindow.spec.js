import {shallowMount, createLocalVue} from '@vue/test-utils';
import Vuex from 'vuex';
import TestWindow from '@/components/TestWindow';
import MockDate from 'mockdate';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('components/TestWindow', () => {
  let subject;
  const createTestSubject = (mockGetters) => {
    const defaultMockGetters = {
      test: () => ({
        openingTime: new Date('2019-06-20 09:00'),
        closingTime: new Date('2019-06-20 18:00'),
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

  afterEach(() => {
    // Reset Date if it was mocked with MockDate
    MockDate.reset();
  });

  it('renders in a HTML <div> tag', () => {
    subject = createTestSubject({});
    expect(subject.is('div')).toBe(true);
  });

  describe('before test day', () => {
    beforeEach(() => {
      MockDate.set(new Date('2019-06-19'));
      subject = createTestSubject({
        test: () => ({
          openingTime: new Date('2019-06-20 09:00'),
          closingTime: new Date('2019-06-20 18:00'),
        }),
        testHasOpened: () => false,
        testHasClosed: () => false,
        testIsOpen:    () => false,
      });
    });

    it('starts "The test window will be open on"', () => {
      expect(subject.text()).toStartWith('The test window will be open on');
    });

    it('shows the date of the test', () => {
      expect(subject.text()).toContain('20 June 2019');
    });

    it('shows the opening and closing times', () => {
      expect(subject.text()).toContain('between 9am and 6pm');
    });
  });

  describe('on test day, before the test window has opened', () => {
    beforeEach(() => {
      MockDate.set(new Date('2019-06-20 08:45'));
      subject = createTestSubject({
        test: () => ({
          openingTime: new Date('2019-06-20 09:00'),
          closingTime: new Date('2019-06-20 18:00'),
        }),
        testHasOpened: () => false,
        testHasClosed: () => false,
        testIsOpen:    () => false,
      });
    });

    it('starts "The test window will be open today"', () => {
      expect(subject.text()).toStartWith('The test window will be open today');
    });

    it('shows the opening and closing times', () => {
      expect(subject.text()).toContain('between 9am and 6pm');
    });
  });

  describe('on test day, when the test window is open', () => {
    beforeEach(() => {
      MockDate.set(new Date('2019-06-20 12:00'));
      subject = createTestSubject({
        test: () => ({
          openingTime: new Date('2019-06-20 09:00'),
          closingTime: new Date('2019-06-20 18:00'),
        }),
        testHasOpened: () => true,
        testHasClosed: () => false,
        testIsOpen:    () => true,
      });
    });

    it('starts "The test window is now open"', () => {
      expect(subject.text()).toStartWith('The test window is now open');
    });

    it('shows the closing time', () => {
      expect(subject.text()).toContain('closes at 6pm');
    });

    it('advises to start the test 1 hour before closing time', () => {
      expect(subject.text()).toContain('Start the test no later than 5pm');
    });
  });

  describe('on test day, after the test window has closed', () => {
    beforeEach(() => {
      MockDate.set(new Date('2019-06-20 18:30'));
      subject = createTestSubject({
        test: () => ({
          openingTime: new Date('2019-06-20 09:00'),
          closingTime: new Date('2019-06-20 18:00'),
        }),
        testHasOpened: () => true,
        testHasClosed: () => true,
        testIsOpen:    () => false,
      });
    });

    it('starts "This test has closed."', () => {
      expect(subject.text()).toStartWith('This test has closed.');
    });

    it('says the test was today', () => {
      expect(subject.text()).toContain('The test window was today');
    });

    it('shows the opening and closing times', () => {
      expect(subject.text()).toContain('between 9am and 6pm');
    });
  });

  describe('after test day', () => {
    beforeEach(() => {
      MockDate.set(new Date('2019-06-21'));
      subject = createTestSubject({
        test: () => ({
          openingTime: new Date('2019-06-20 09:00'),
          closingTime: new Date('2019-06-20 18:00'),
        }),
        testHasOpened: () => true,
        testHasClosed: () => true,
        testIsOpen:    () => false,
      });
    });

    it('starts "This test has closed."', () => {
      expect(subject.text()).toStartWith('This test has closed.');
    });

    it('shows the date of the test', () => {
      expect(subject.text()).toContain('20 June 2019');
    });

    it('shows the opening and closing times', () => {
      expect(subject.text()).toContain('between 9am and 6pm');
    });
  });
});

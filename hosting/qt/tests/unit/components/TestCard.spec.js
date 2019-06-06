import {shallowMount} from '@vue/test-utils';
import TestCard from '@/components/TestCard';

describe.skip('components/TestCard', () => {
  let wrapper;

  describe('template', () => {
    const createWrapper = (computed) => {
      return shallowMount(TestCard, {
        propsData: {
          title: 'Situational Judgement',
          number: 1,
        },
        computed: {
          canBeStarted: () => computed.canBeStarted,
          hasBeenStarted: () => computed.hasBeenStarted,
          hasBeenFinished: () => computed.hasBeenFinished,
        },
      });
    };

    beforeEach(() => {
      wrapper = createWrapper({
        canBeStarted: false,
        hasBeenStarted: false,
        hasBeenFinished: false,
      });
    });

    it('shows the phase number and title', () => {
      const cardTitle = wrapper.find('.card-title');
      expect(cardTitle.text()).toEqual('1. Situational Judgement');
    });

    it('says the test will take 45 minutes', () => {
      const cardSubtitle = wrapper.find('.card-subtitle');
      expect(cardSubtitle.text()).toEqual('45 minutes');
    });

    describe('when other tests need to be completed before this one can be started', () => {
      beforeEach(() => {
        wrapper = createWrapper({
          canBeStarted: false,
          hasBeenStarted: false,
          hasBeenFinished: false,
        });
      });

      it('shows a message saying the above tests must be completed', () => {
        expect(wrapper.text()).toContain('You must complete the above test before you can start this one');
      });
    });

    describe('when the test phase can be started', () => {
      beforeEach(() => {
        wrapper = createWrapper({
          canBeStarted: true,
          hasBeenStarted: false,
          hasBeenFinished: false,
        });
      });

      it('shows a button to start the test', () => {
        const button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        expect(button.text()).toBe('Start test');
      });

      describe('when the start button is clicked', () => {
        it.skip('starts the timer and opens the test form', () => {
          wrapper.setMethods({start: jest.fn()});
          wrapper.find('button').trigger('click');
          expect(wrapper.vm.start).toHaveBeenCalledTimes(1);
        });
      });

      describe('while the test is starting', () => {
        beforeEach(() => {
          wrapper.setData({
            isStarting: true,
          });
        });

        it('shows a spinner', () => {
          const spinner = wrapper.find('.spinner-border');
          expect(spinner.exists()).toBe(true);
        });
        it('disables the start button', () => {
          const button = wrapper.find('button');
          expect(button.attributes('disabled')).toBeTruthy();
        });
      });
    });

    describe('when the test phase is in progress', () => {
      beforeEach(() => {
        wrapper = createWrapper({
          canBeStarted: false,
          hasBeenStarted: true,
          hasBeenFinished: false,
        });
      });

      it('says "Test in progress"', () => {
        expect(wrapper.text()).toContain('Test in progress');
      });

      it('shows a button to return to the test', () => {
        const button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        expect(button.text()).toBe('Return to test');
      });

      describe('when the button is clicked', () => {
        it('opens the test form', () => {
          wrapper.setMethods({openForm: jest.fn()});
          wrapper.find('button').trigger('click');
          expect(wrapper.vm.openForm).toHaveBeenCalled();
        });
      });
    });

    describe('when the test phase has been completed', () => {
      beforeEach(() => {
        wrapper = createWrapper({
          canBeStarted: false,
          hasBeenStarted: true,
          hasBeenFinished: true,
        });
      });

      it('says the phase is complete', () => {
        expect(wrapper.text()).toContain('You have completed this phase');
      });

      it("doesn't show any buttons", () => {
        const button = wrapper.find('button');
        expect(button.exists()).toBe(false);
      });
    });
  });

  describe('script', () => {
    let store;

    beforeEach(() => {
      store = {
        dispatch: jest.fn(),
        getters: {
          qtPhaseCanBeStarted: () => false,
          qtPhaseHasBeenStarted: () => false,
          qtPhaseHasBeenFinished: () => false,
          qtPhaseFormUrl: () => 'https://google.com',
        },
      };

      wrapper = shallowMount(TestCard, {
        propsData: {
          title: 'Situational Judgement',
          number: 1,
        },
        mocks: {
          $store: store,
        },
      });
    });

    describe('props', () => {
      describe('`title`', () => {
        let prop;
        beforeEach(() => {
          prop = TestCard.props.title;
        });

        it('is required', () => {
          expect(prop.required).toBe(true);
        });

        it('must be a String', () => {
          expect(prop.type).toBe(String);
        });
      });

      describe('`number`', () => {
        let prop;
        beforeEach(() => {
          prop = TestCard.props.number;
        });

        it('is required', () => {
          expect(prop.required).toBe(true);
        });

        it('must be a Number', () => {
          expect(prop.type).toBe(Number);
        });
      });
    });

    describe('data (initial state)', () => {
      it('`isStarting` is `false`', () => {
        expect(wrapper.vm.isStarting).toBe(false);
      });
    });

    describe('computed properties', () => {
      const dynamicGetters = [
      //[
      //  computed field name,
      //  Vuex getter function name,
      //  mock return value,
      //],
        [
          'canBeStarted',
          'qtPhaseCanBeStarted',
          true,
        ],
        [
          'hasBeenStarted',
          'qtPhaseHasBeenStarted',
          true,
        ],
        [
          'hasBeenFinished',
          'qtPhaseHasBeenFinished',
          true,
        ],
        [
          'formUrl',
          'qtPhaseFormUrl',
          'https://google.com',
        ],
      ];

      describe.each(dynamicGetters)('`%s`', (field, getter, value) => {
        beforeEach(() => {
          store.getters[getter] = jest.fn(() => value);
          wrapper.vm[field]; // to trigger the computed value getter
        });

        it(`executes Vuex getter \`$store.${getter}(this.title)\``, () => {
          expect(store.getters[getter]).toHaveBeenCalledWith('Situational Judgement');
          expect(store.getters[getter]).toHaveBeenCalledTimes(1);
        });

        it(`returns the value of Vuex getter \`$store.${getter}(this.title)\``, () => {
          expect(wrapper.vm[field]).toBe(value);
        });
      });
    });

    describe('methods', () => {
      describe.skip('#start', () => {
        beforeEach(() => {
          wrapper.setMethods({
            openForm: jest.fn(),
          });
        });

        it('returns a Promise', () => {
          expect(wrapper.vm.start()).toBeInstanceOf(Promise);
        });

        describe('the Promise', () => {
          it('sets `isStarting` to true', async () => {
            expect(wrapper.vm.isStarting).toBe(true);
            await wrapper.vm.start();
            expect(wrapper.vm.isStarting).toBe(true);
          });

          it('dispatches `startQtPhase` for the phase title', async () => {
            await wrapper.vm.start();
            expect(store.dispatch).toHaveBeenCalledWith('startQtPhase', 'Situational Judgement');
          });

          describe('when dispatched `startQtPhase` Promise resolves', () => {
            it('sets `isStarting` to false', () => {

            });

            it('runs `#openForm` to open the form', () => {

            });
          });
        });
      });

      describe('#openForm', () => {
        it('opens the form URL in a new tab', () => {
          const spy = jest.spyOn(window, 'open').mockImplementation(() => (null));
          wrapper.vm.openForm();
          expect(spy).toHaveBeenCalledWith('https://google.com');
          expect(spy).toHaveBeenCalledTimes(1);
          spy.mockRestore();
        });
      });
    });
  });
});

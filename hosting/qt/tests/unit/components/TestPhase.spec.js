import {shallowMount} from '@vue/test-utils';
import TestPhase from '@/components/TestPhase';

const returnTrue = () => (true);
const returnFalse = () => (false);

describe('components/TestPhase', () => {
  let store, wrapper;

  beforeEach(() => {
    store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        qtPhaseCanBeStarted: returnFalse,
        qtPhaseHasBeenStarted: returnFalse,
        qtPhaseHasBeenFinished: returnFalse,
      },
    };

    wrapper = shallowMount(TestPhase, {
      propsData: {
        title: 'Situational Judgement',
        number: 1,
      },
      mocks: {
        $store: store,
      },
    });
  });

  describe('template', () => {
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
        store.getters.qtPhaseCanBeStarted = returnFalse;
        store.getters.qtPhaseHasBeenStarted = returnFalse;
        store.getters.qtPhaseHasBeenFinished = returnFalse;
      });

      it('shows a message saying the above tests must be completed', () => {
        expect(wrapper.text()).toContain('You must complete the above test before you can start this one');
      });
    });

    describe('when the test phase can be started', () => {
      beforeEach(() => {
        store.getters.qtPhaseCanBeStarted = returnTrue;
        store.getters.qtPhaseHasBeenStarted = returnFalse;
        store.getters.qtPhaseHasBeenFinished = returnFalse;
      });

      it('shows a button to start the test', () => {
        const button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        expect(button.text()).toBe('Start test');
      });

      describe('when the start button is clicked', () => {
        it('starts the timer and opens the test form', () => {
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
        store.getters.qtPhaseCanBeStarted = returnFalse;
        store.getters.qtPhaseHasBeenStarted = returnTrue;
        store.getters.qtPhaseHasBeenFinished = returnFalse;
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
        store.getters.qtPhaseCanBeStarted = returnFalse;
        store.getters.qtPhaseHasBeenStarted = returnTrue;
        store.getters.qtPhaseHasBeenFinished = returnTrue;
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
});

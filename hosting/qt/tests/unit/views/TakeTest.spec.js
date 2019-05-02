import {shallowMount} from "@vue/test-utils";
import TakeTest from '@/views/TakeTest';

const mockQt = {
  title: 'Combined QT',
  opening_time: new Date('2019-04-24 06:00'),
  closing_time: new Date('2019-04-24 21:00'),
  phases: [
    {
      title: 'Situational Judgement',
      form_url: 'https://qt.judicialappointments.digital/test/situational-judgement',
    },
    {
      title: 'Critical Analysis',
      form_url: 'https://qt.judicialappointments.digital/test/critical-analysis',
    }
  ],
};

/**
 * Helper function to collapse string whitespace (spaces & newlines) into single spaces.
 * @param string
 * @returns string
 */
const collapseWhitespace = (string) => {
  return string.replace(/[\s\n]+/g, ' ');
};

describe('views/TakeTest', () => {
  let store, wrapper;

  beforeEach(() => {
    store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        qt: mockQt,
        qtHasOpened: false,
        qtHasClosed: false,
        qtPhaseFormUrl: null,
        qtPhaseCanBeStarted: null,
        qtPhaseHasBeenStarted: null,
        qtPhaseHasBeenFinished: null,
        allQtPhasesFinished: null,
      },
    };

    wrapper = shallowMount(TakeTest, {
      mocks: {
        $store: store,
      }
    });
  });

  describe.skip('lifecycle hooks', () => {
    describe('#mounted', () => {
      let mockLoadQtData;
      describe('initial loading state', () => {
        beforeEach(() => {
          mockLoadQtData = jest.fn();
          wrapper = shallowMount(TakeTest, {
            mocks: {
              $store: store,
            },
            methods: {
              loadQtData: mockLoadQtData,
            },
          });
        });

        it('renders "Loading..." text', () => {
          expect(wrapper.text()).toContain('Loading...');
        });

        it('renders an animated spinner', () => {
          const spinner = wrapper.find('.spinner-border');
          expect(spinner.exists()).toBe(true);
          expect(spinner.isVisible()).toBe(true);
        });

        it('commits the hardcoded Qualifying Test ID to the store', () => {
          const expectQtId = 'ANEMLDHK21g6HtnXQBiC';
          expect(store.commit).toHaveBeenCalledWith('setQtId', expectQtId);
        });

        it('executes `this.loadQtData`', () => {
          expect(mockLoadQtData).toHaveBeenCalled();
        });
      });

      /*it.each(['loadQt', 'loadQtSummary'])('dispatches "%s" to the store', (action) => {
        expect(store.dispatch).toHaveBeenCalledWith(action);
      });*/

      /*describe('when both "loadQt" and "loadQtSummary" Promises resolve', () => {
        beforeEach(() => {
          store.dispatch.mockResolvedValue();
        });
      });*/
    });
  });

  describe.skip('methods', () => {
    describe('#loadQtData', () => {
      it.each(['loadQt', 'loadQtSummary'])('dispatches "%s" to the Vuex store', (action) => {
        expect(store.dispatch).toHaveBeenCalledWith(action);
      });
    });
  });

  describe('template', () => {
    let loadingMessage, errorMessage, qtView;
    const findElements = () => {
      loadingMessage = wrapper.find({ref: 'loadingMessage'});
      errorMessage = wrapper.find({ref: 'errorMessage'});
      qtView = wrapper.find({ref: 'qtView'});
    };

    describe("when the QT data hasn't loaded yet", () => {
      beforeEach(() => {
        wrapper.setData({
          loaded: false,
          loadFailed: false,
        });
        findElements();
      });

      it('shows a loading message', () => {
        expect(loadingMessage.exists()).toBe(true);
        expect(loadingMessage.isVisible()).toBe(true);
      });

      it('loading message matches snapshot', () => {
        expect(loadingMessage.element).toMatchSnapshot();
      });

      it("doesn't show an error message", () => {
        expect(errorMessage.exists()).toBe(false);
      });

      it("doesn't show details of the QT", () => {
        expect(qtView.exists()).toBe(false);
      });
    });

    describe('when the QT data failed to load', () => {
      beforeEach(() => {
        wrapper.setData({
          loaded: false,
          loadFailed: true,
        });
        findElements();
      });

      it('shows an error message', () => {
        expect(errorMessage.exists()).toBe(true);
        expect(errorMessage.isVisible()).toBe(true);
      });

      it('error message matches snapshot', () => {
        expect(errorMessage.element).toMatchSnapshot();
      });

      it('no longer shows the loading message', () => {
        expect(loadingMessage.exists()).toBe(false);
      });

      it("doesn't show details of the QT", () => {
        expect(qtView.exists()).toBe(false);
      });
    });

    describe('when the QT data has loaded', () => {
      beforeEach(() => {
        store.getters.qt = mockQt;
        wrapper.setData({
          loaded: true,
          loadFailed: false,
        });
        findElements();
      });

      it('shows details of the QT', () => {
        expect(qtView.exists()).toBe(true);
      });

      it('no longer shows the loading message', () => {
        expect(loadingMessage.exists()).toBe(false);
      });

      it("doesn't show an error message", () => {
        expect(errorMessage.exists()).toBe(false);
      });

      it('shows the title of the QT', () => {
        expect(wrapper.find('h2').text()).toBe('Combined QT');
      });

      describe("the QT hasn't opened yet", () => {
        beforeEach(() => {
          store.getters.qtHasOpened = false;
          store.getters.qtHasClosed = false;
        });

        it('says the QT is closed', () => {
          expect(wrapper.text()).toContain('This qualifying test is currently closed.');
        });

        it('says when it will open', () => {
          const date = mockQt.opening_time.toLocaleDateString();
          const time = mockQt.opening_time.toLocaleTimeString();
          const expected = `It'll open at ${time} on ${date}`;
          const wrapperText = collapseWhitespace(wrapper.text());
          expect(wrapperText).toContain(expected);
        });
      });

      describe('the QT has already closed', () => {
        beforeEach(() => {
          store.getters.qtHasOpened = true;
          store.getters.qtHasClosed = true;
        });

        it('says the QT has closed', () => {
          expect(wrapper.text()).toContain('This qualifying test has now closed.');
        });
      });

      describe('the QT is open', () => {
        beforeEach(() => {
          store.getters.qtHasOpened = true;
          store.getters.qtHasClosed = false;
        });

        it('lists each phase of the test', () => {

        });

        describe('each test phase', () => {
          it('shows the phase title', () => {

          });


        });
      });
    });
  });

  describe('script', () => {

  });
});

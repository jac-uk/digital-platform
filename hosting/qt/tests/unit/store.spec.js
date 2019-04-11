import store from '@/store';
import Vue from 'vue';
import Vuex from 'vuex';

import auth from '@/store/auth';

jest.mock('vue', () => {
  return {
    use: jest.fn()
  };
});

jest.mock('vuex', () => {
  return {
    Store: jest.fn((config) => {
      return config;
    })
  };
});

describe('Vuex store', () => {
  it('has strict mode enabled', () => {
    expect(store.strict).toBe(true);
  });

  it('registers Vuex to the Vue instance', () => {
    expect(Vue.use).toHaveBeenCalledWith(Vuex);
  });

  it('creates a new Vuex Store', () => {
    expect(Vuex.Store).toHaveBeenCalled();
  });

  const modules = [
    ['auth', auth],
  ];
  it.each(modules)('registers module `%s`', (moduleName, module) => {
    expect(store.modules[moduleName]).toBe(module);
  });
});

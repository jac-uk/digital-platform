import store from '@/store';
import Vuex from 'vuex';

import auth from '@/store/auth';

jest.mock('vuex', () => {
  return {
    Store: jest.fn((config) => {
      return config;
    }),
  };
});

describe('Vuex store', () => {
  it('has strict mode enabled', () => {
    expect(store.strict).toBe(true);
  });

  it('creates a new Vuex Store', () => {
    expect(Vuex.Store).toHaveBeenCalled();
  });

  const modules = [
    ['auth', auth]
  ];
  it.each(modules)('registers module `%s`', (moduleName, module) => {
    expect(store.modules[moduleName]).toBe(module);
  });
});

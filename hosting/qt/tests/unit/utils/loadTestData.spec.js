import loadTestData from '@/utils/helpers/loadTestData.js';

describe('loadTest', () => {
  let route = {
    params: {
      id: 111,
    },
  };

  let store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
  };

  it('calls store commit function', () => {
    loadTestData(store, route);

    expect(store.commit).toHaveBeenCalled();
  });

  it('dispatches loadTest action', () => {
    loadTestData(store, route);

    expect(store.dispatch).toHaveBeenCalledWith('loadTest');
  });

  it('dispatches loadUserTest action', () => {
    loadTestData(store, route);

    expect(store.dispatch).toHaveBeenCalledWith('loadUserTest');
  });

  it('dispatches subscribeUserTest action', () => {
    loadTestData(store, route);

    expect(store.dispatch).toHaveBeenCalledWith('subscribeUserTest');
  });
});

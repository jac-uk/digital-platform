const loadTestData = async (store, route) => {
  store.commit('setTestId', route.params.id);

  return Promise.all([
    store.dispatch('loadTest'),
    store.dispatch('loadUserTest'),
  ]).then(() => {
    store.dispatch('subscribeUserTest');
  });
};

export default loadTestData;

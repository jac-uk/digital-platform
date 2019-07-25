const loadTestData = async (store, route) => {
  store.commit('setTestId', route.params.id);
  try {
    await store.dispatch('loadTest');
    await store.dispatch('loadUserTest');
    await store.dispatch('subscribeUserTest');
    return true;
  }
  catch(er) {
    throw er;
  }
};

export default loadTestData;

import Vue from 'vue'
import Router from 'vue-router';
import App from '@/App.vue';
import Vuex from 'vuex';
import {auth} from '@/firebase';

Vue.config.productionTip = false;
Vue.use(Router);
Vue.use(Vuex);

const router = require('@/router').default;
const store = require('@/store').default;

let vueInstance = false;
auth().onAuthStateChanged((user) => {
  // Bind Firebase auth state to the vuex auth state store
  store.dispatch('setCurrentUser', user);

  // Create the Vue instance, but only once
  if (!vueInstance) {
    vueInstance = new Vue({
      el: '#app',
      render: h => h(App),
      router,
      store,
    });
  }
});
 

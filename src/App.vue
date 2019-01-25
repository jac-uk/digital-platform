<template>
  <div id="app">
    <nav v-if="authUser">
      <router-link to="/apply">Apply</router-link>
      <a href="#" @click.prevent="logOut">Logout</a>
    </nav>

    <RouterView :authUser="authUser"/>
  </div>
</template>

<script>
import ApplicationForm from './components/ApplicationForm';
import {auth} from '@/firebase';

export default {
  name: 'app',
  components: {
    ApplicationForm
  },
  data() {
    return {
      authUser: auth().currentUser,
    };
  },
  methods: {
    logOut() {
      auth().signOut();
    }
  },
  mounted() {
    auth().onAuthStateChanged((user) => {
      this.authUser = user;
    });
  }
}
</script>

<style>
.container {
  max-width: 960px;
}
</style>

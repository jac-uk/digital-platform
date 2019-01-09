<template>
  <div id="app" class="container-fluid">
    <nav v-if="authUser">
      <router-link to="/">Home</router-link>
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
#app {
  max-width: 600px;
}
</style>

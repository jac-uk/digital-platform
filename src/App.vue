<template>
  <div id="app" class="container-fluid">
    <router-link to="/">Home</router-link>
    <router-link to="/login">Login</router-link>
    <a href="#" @click.prevent="logOut">Logout</a>
    <router-view></router-view>
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
  methods: {
    logOut() {
      auth().signOut();
    }
  },
}
</script>

<style>
#app {
  max-width: 600px;
}
</style>

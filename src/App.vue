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
import {auth} from '@/firebase';

export default {
  name: 'app',
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
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
  },
  watch: {
    isLoggedIn(loggedIn) {
      if (loggedIn === false) {
        this.$router.push('/login');
      }
    },
  },
}
</script>

<style lang="scss">
.container {
  max-width: 960px;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

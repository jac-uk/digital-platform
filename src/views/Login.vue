<template>
  <div class="login">
    <h3>Login</h3>
    <p>You're not authenticated. Please login.</p>
    <FirebaseUI @signInSuccess="loginRedirect" />
  </div>
</template>

<script>
  import FirebaseUI from '@/components/FirebaseUI';

  export default {
    name: "Login",
    components: {
      FirebaseUI
    },
    methods: {
      loginRedirect(authResult) {
        this.$store.dispatch('setCurrentUser', authResult.user);
        this.$router.push('/');
      }
    }
  }
</script>

<style scoped>

</style>

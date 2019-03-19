<template>
  <main class="container">
    <div class="text-center mb-3 mt-5">
      <img src="@/assets/jac-logo.svg" alt="Judicial Appointments Commission" width="197" height="66">
    </div>
    <p>
      To apply for this role, you’ll need to create an account with your email address and a password. We’ll send you
      a link to verify your email address.
    </p>
    <p>
      If you’ve already registered, sign in to return to your application.
    </p>
    <FirebaseUI @signInSuccess="loginRedirect" />
  </main>
</template>

<script>
  import FirebaseUI from '@/components/FirebaseUI';

  export default {
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
  .container {
    max-width: 360px;
  }
</style>

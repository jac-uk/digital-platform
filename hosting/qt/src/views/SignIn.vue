<template>
  <main class="mt-3">
    <div class="login-container">
      <div class="text-center mb-3 mt-5">
        <img
          src="@/assets/jac-logo.svg"
          alt="Judicial Appointments Commission"
          width="197"
          height="66"
        >
      </div>
      <IEWarning />
      <p>To take this test, set up an account with the email address you used for your application and then choose a password.</p>
      <FirebaseUI @signInSuccess="loginRedirect" />
    </div>
  </main>
</template>

<script>
import FirebaseUI from '@/components/FirebaseUI';
import IEWarning from '@/components/IEWarning';

export default {
  components: {
    FirebaseUI,
    IEWarning,
  },
  methods: {
    loginRedirect(authResult) {
      this.$store.dispatch('setCurrentUser', authResult.user);
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
  .login-container {
    max-width: 360px;
    margin: 0 auto;
  }
</style>

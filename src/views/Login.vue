<template>
  <main>
    <div class="text-center mb-3 mt-5">
      <img src="@/assets/jac-logo.svg" alt="Judicial Appointments Commission" width="197" height="66">
    </div>
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

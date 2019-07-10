<template>
  <main>
    <div>
      This is sign in

      <FirebaseUI @signInSuccess="loginRedirect" />
    </div>
  </main>
</template>

<script>
  import FirebaseUI from '@/components/FirebaseUI';

  export default {
    components: {
      FirebaseUI,
    } ,
    methods: {
      loginRedirect(authResult) {
        this.$store.dispatch('setCurrentUser', authResult.user);
        this.$router.push('/dashboard');
      }
    }
  }
</script>

<style scoped>
</style>

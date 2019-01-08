<template>
  <div class="login">
    <h3>Login</h3>
    <p>You're not authenticated. Please login.</p>
    <FirebaseUI/>
  </div>
</template>

<script>
  import FirebaseUI from '@/components/FirebaseUI';

  export default {
    name: "Login",
    components: {
      FirebaseUI
    },
  }
</script>

<style scoped>

</style>

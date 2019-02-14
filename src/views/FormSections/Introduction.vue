<template>
  <section>
    <h2>Introduction</h2>
    <p>You are applying for <strong>{{vacancy.jac_ref}}: {{vacancy.title}}</strong></p>
  </section>
</template>

<script>
  export default {
    name: "Introduction",
    data() {
      return {
        vacancy: this.$store.getters.vacancy,
      };
    },
  }
</script>

<style scoped>

</style>

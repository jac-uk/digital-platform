<template>
  <section>
    <h2>Check your answers before sending your application</h2>
  </section>
</template>

<script>
export default {
  name: "ReviewAndSubmit",
  data() {
    return {
      vacancy: this.$store.getters.vacancy,
    };
  },
}
</script>

<style scoped>

</style>

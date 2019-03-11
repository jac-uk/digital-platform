<template>
  <section>
    <h2>Check your answers before sending your application</h2>
    <Personal />
  </section>
</template>

<script>
import Personal from '@/views/FormSections/PersonalDetails/Edit';
export default {
  name: "ReviewAndSubmit",
  components: { "Personal": Personal },
  data() {
    return {
      vacancy: this.$store.getters.vacancy,
    };
  },
}
</script>

<style scoped>

</style>

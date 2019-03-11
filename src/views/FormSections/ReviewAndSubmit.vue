<template>
  <section>
    <h2>Check your answers before sending your application</h2>
    <Personal />
    <Qualifications/>
  </section>
</template>

<script>
import Personal from '@/views/FormSections/PersonalDetails/Show';
import Qualifications from '@/views/FormSections/Qualifications/Show';
export default {
  name: "ReviewAndSubmit",
  components: {
    Personal,
    Qualifications
  },
  data() {
    return {
      vacancy: this.$store.getters.vacancy,
    };
  },
}
</script>

<style scoped>

</style>

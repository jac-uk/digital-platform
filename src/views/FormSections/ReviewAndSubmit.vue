<template>
  <section>
    <h2>Check your answers before sending your application</h2>
    <Personal />
    <Qualifications />
    <Experience />
  </section>
</template>

<script>
import Personal from '@/views/FormSections/PersonalDetails/Show';
import Qualifications from '@/views/FormSections/Qualifications/Show';
import Experience from '@/views/FormSections/Experience/Show';
export default {
  name: "ReviewAndSubmit",
  components: {
    Personal,
    Qualifications,
    Experience
  },
  data() {
    return {
      vacancy: this.$store.getters.vacancy,
    };
  },
}
</script>

<template>
  <section>
    <h2>Check your answers before sending your application</h2>
    <Personal />
    <Qualifications />
    <Experience />
  </section>
</template>

<script>
import Experience from '@/views/Sections/Experience/Show';
import Personal from '@/views/Sections/Personal/Show';
import Qualifications from '@/views/Sections/Qualifications/Show';
export default {
  components: {
    Experience,
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

<template>
  <section>
    <h2>Check your answers before sending your application</h2>
    <Citizenship />
    <Personal />
    <Qualifications />
    <Experience />
    <SelfAssessment />
    <Assessors />
    <Character />
    <Preferences />
    <Declarations />
  </section>
</template>

<script>
import Citizenship from '@/views/Sections/Citizenship/Show';
import Experience from '@/views/Sections/Experience/Show';
import Personal from '@/views/Sections/Personal/Show';
import Qualifications from '@/views/Sections/Qualifications/Show';
import SelfAssessment from '@/views/Sections/SelfAssessment/Show';
import Assessors from '@/views/Sections/Assessors/Show';
import Character from '@/views/Sections/Character/Show';
import Preferences from '@/views/Sections/Preferences/Show';
import Declarations from '@/views/Sections/Declarations/Show';
export default {
  components: {
    Citizenship,
    Experience,
    Personal,
    Qualifications,
    SelfAssessment,
    Assessors,
    Character,
    Preferences,
    Declarations
  },
  data() {
    return {
      vacancy: this.$store.getters.vacancy,
    };
  },
}
</script>

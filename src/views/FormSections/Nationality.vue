<template>
  <section>
    <form @submit.prevent="save">
      <h2>Nationality</h2>

      <fieldset>
        <legend>What’s your nationality?</legend>
        <SelectList id="nationality" :options="nationalityOptions" v-model="applicant.nationality" />
        <div v-if="applicant.nationality === 'Non-Commonwealth'" class="mt-3">
          Email <a href="mailto:dcj128@judicialappointments.gov.uk">dcj128@judicialappointments.gov.uk</a> or
          call <a href="tel:+442033340123">020 3334 0123</a> to discuss your application
        </div>
      </fieldset>

      <SaveAndContinueButtons :isSaving="isSaving" @saveAndContinue="saveAndContinue" />
    </form>
  </section>
</template>

<script>
  import SelectList from '@/components/SelectList';
  import SaveAndContinueButtons from '@/components/SaveAndContinueButtons';

  export default {
    components: {
      SaveAndContinueButtons,
      SelectList,
    },
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        isSaving: false,
        nationalityOptions: [
          {value: "British", label: "I'm British (including English, Scottish, Welsh and Northern Irish)"},
          {value: "Irish", label: "I'm Irish"},
          {value: "Commonwealth", label: "I'm a citizen of a Commonwealth country"},
          {value: "Non-Commonwealth", label: "I'm none of these"},
        ],
      };
    },
    methods: {
      async save() {
        this.isSaving = true;
        await this.$store.dispatch('saveApplicant', this.applicant);
        this.isSaving = false;
      },
      async saveAndContinue() {
        await this.save();
        this.$emit('continue');
      },
    }
  }
</script>

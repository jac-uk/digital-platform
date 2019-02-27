<template>
  <section>
    <form @submit.prevent="save">
      <h2>Nationality</h2>

      <fieldset>
        <legend>What’s your nationality?</legend>
        <SelectList :options="nationalityOptions" v-model="applicant.nationality" />
        <div v-if="applicant.nationality === 'Non-Commonwealth'" class="mt-3">
          Email <a href="mailto:dcj128@judicialappointments.gov.uk">dcj128@judicialappointments.gov.uk</a> or
          call <a href="tel:+442033340123">020 3334 0123</a> to discuss your application
        </div>
      </fieldset>

      <div class="form-actions">
        <button class="btn btn-primary mr-2" type="button" @click.prevent="saveAndContinue">Save and Continue</button>
        <button class="btn btn-outline-secondary" type="submit">
          Save as Draft
          <span class="spinner-border spinner-border-sm" v-if="isSaving"></span>
        </button>
      </div>
    </form>
  </section>
</template>

<script>
  import SelectList from '@/components/SelectList';

  export default {
    name: "Nationality",
    components: {
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
      async saveAndContinue() {
        await this.save();
        this.$emit('continue');
      },
      async save() {
        this.isSaving = true;
        await this.$store.dispatch('saveApplicant', this.applicant);
        this.isSaving = false;
      }
    }
  }
</script>

<style scoped>

</style>

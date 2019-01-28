<template>
  <section>
    <form @submit.prevent="saveAndContinue">
      <h2>Your Nationality</h2>
      <h3>Are you eligible to apply?</h3>
      <p>You need to be a citizen of:</p>
      <ul>
        <li>the United Kingdom, or</li>
        <li>another Commonwealth country, or</li>
        <li>the Republic of Ireland.</li>
      </ul>

      <div class="form-check">
        <input class="form-check-input" type="radio" id="eligibility_no" :value="false" v-model="applicant.eligible">
        <label class="form-check-label" for="eligibility_no">
          No, I'm not eligible
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" id="eligibility_yes" :value="true" v-model="applicant.eligible">
        <label class="form-check-label" for="eligibility_yes">
          Yes, I'm eligible
        </label>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary mr-2" type="submit">Save and Continue</button>
        <button class="btn btn-outline-secondary" @click.prevent="save">
          Save as Draft
          <span class="spinner-border spinner-border-sm" v-if="isSaving"></span>
        </button>
      </div>
    </form>
  </section>
</template>

<script>
  export default {
    name: "Nationality",
    props: {
      applicantDoc: Object,
      applicationDoc: Object,
    },
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        application: this.applicationDoc,
        isSaving: false,
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

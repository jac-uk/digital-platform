<template>
  <section>
    <form @submit.prevent="save">
      <h2>About You</h2>

      <div class="form-row">
        <div class="col-sm-6 mb-3">
          <label for="forename">Forename</label>
          <input type="text" class="form-control" id="forename" v-model="applicant.forename">
        </div>
        <div class="col-sm-6 mb-3">
          <label for="surname">Surname</label>
          <input type="text" class="form-control" id="surname" v-model="applicant.surname">
        </div>
      </div>

      <div class="form-group">
        <label for="dob">Date of Birth</label>
        <input type="date" class="form-control" id="dob" v-model="applicant.dob">
      </div>

      <div class="form-group">
        <label for="national_insurance">National Insurance Number</label>
        <input type="text" class="form-control" id="national_insurance" v-model="applicant.national_insurance">
        <small id="passwordHelpBlock" class="form-text text-muted">
          It’s on your National Insurance card, benefit letter, payslip or P60. For example, ‘QQ 12 34 56 C’.
        </small>
      </div>

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
  export default {
    name: "Personal",
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

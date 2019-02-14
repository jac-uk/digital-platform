<template>
  <section>
    <form @submit.prevent="save">
      <h2>Your Nationality</h2>

      <fieldset>
        <legend>Your Nationality</legend>
        <div class="fieldset-text">
          We need to know your nationality to determine your eligibility for this role.
        </div>
        <details class="fieldset-text">
          <summary>Which nationalities are eligible for this role?</summary>
          <div>
            <p>To be eligible for this role, you need to be a citizen of:</p>
            <ul>
              <li>the United Kingdom, or</li>
              <li>another Commonwealth country, or</li>
              <li>the Republic of Ireland.</li>
            </ul>
            <p>Unfortunately other nationalities will not be considered for this role.</p>
          </div>
        </details>
        <p>I am a citizen of:</p>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_uk" value="United Kingdom" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_uk">
            the United Kingdom
          </label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_commonwealth" value="Commonwealth" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_commonwealth">
            another Commonwealth country
          </label>
          <select class="form-control" v-model="applicant.commonwealth_country" v-if="applicant.nationality === 'Commonwealth'">
            <option :value="undefined">Please specify...</option>
            <option v-for="country in commonwealthCountries" :value="country" :key="country">
              {{country}}
            </option>
          </select>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_ireland" value="Republic of Ireland" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_ireland">
            the Republic of Ireland
          </label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_other" value="Other" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_other">
            none of the above
          </label>
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
  import commonwealthCountries from '@/datalists/commonwealth-countries';

  export default {
    name: "Nationality",
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        isSaving: false,
        commonwealthCountries,
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

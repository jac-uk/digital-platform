<template>
  <section>
    <form @submit.prevent="save">
      <h2>Diversity</h2>

      <fieldset>
        <legend>Sharing my diversity data</legend>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="diversity_consent_yes" :value="true" v-model="applicant.diversity_consent">
          <label class="custom-control-label" for="diversity_consent_yes">
            You may share my diversity data with the MoJ, Judicial Office and HMCTS (for monitoring purposes only)
          </label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="diversity_consent_no" :value="false" v-model="applicant.diversity_consent">
          <label class="custom-control-label" for="diversity_consent_no">
            DO NOT share my diversity data
          </label>
        </div>
      </fieldset>

      <div v-if="applicant.diversity_consent">
        <fieldset>
          <legend>What is your professional background? Select all that apply.</legend>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="professional_background_solicitor" value="Solicitor" v-model="applicant.professional_background">
            <label class="custom-control-label" for="professional_background_solicitor">
              Solicitor
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="professional_background_barrister" value="Barrister" v-model="applicant.professional_background">
            <label class="custom-control-label" for="professional_background_barrister">
              Barrister
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="professional_background_cilex" value="CILEx" v-model="applicant.professional_background">
            <label class="custom-control-label" for="professional_background_cilex">
              CILEx
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="professional_background_no_answer" value="I prefer not to answer this question" v-model="applicant.professional_background">
            <label class="custom-control-label" for="professional_background_no_answer">
              I prefer not to answer this question
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="professional_background_other" :value="true" v-model="applicant.professional_background_has_other">
            <label class="custom-control-label" for="professional_background_other">
              Other (please specify)
            </label>
            <input v-if="applicant.professional_background_has_other" type="text" class="form-control" v-model="applicant.professional_background_other">
          </div>
        </fieldset>

        <fieldset>
          <legend>What is your current legal role? If you currently hold multiple roles, select all that apply.</legend>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_academic" value="Academic" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_academic">
              Academic
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_barrister" value="Barrister" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_barrister">
              Barrister
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_fee_court" value="Fee-paid court judge" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_fee_court">
              Fee-paid court judge
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_fee_tribunal" value="Fee-paid tribunal judge" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_fee_tribunal">
              Fee-paid tribunal judge
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_cilex" value="Fellow of CILEx" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_cilex">
              Fellow of CILEx
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_fee_judicial" value="Other fee-paid judicial office holder" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_fee_judicial">
              Other fee-paid judicial office holder
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_salaried_judicial" value="Other salaried judicial office holder" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_salaried_judicial">
              Other salaried judicial office holder
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_salaried_court" value="Salaried court judge" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_salaried_court">
              Salaried court judge
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_salaried_tribunal" value="Salaried tribunal judge" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_salaried_tribunal">
              Salaried tribunal judge
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_solicitor" value="Solicitor" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_solicitor">
              Solicitor
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_no_answer" value="I prefer not to answer this question" v-model="applicant.current_role">
            <label class="custom-control-label" for="current_role_no_answer">
              I prefer not to answer this question
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_role_other" :value="true" v-model="applicant.current_role_has_other">
            <label class="custom-control-label" for="current_role_other">
              Other (please specify)
            </label>
            <input v-if="applicant.current_role_has_other" type="text" class="form-control" v-model="applicant.current_role_other">
          </div>
        </fieldset>
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
    name: 'Diversity',
    data() {
      const applicant = this.$store.getters.applicant();

      // Initialise empty arrays to enable multiple checkbox values
      if (!applicant.professional_background) {
        applicant.professional_background = [];
      }
      if (!applicant.current_role) {
        applicant.current_role = [];
      }

      return {
        applicant,
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
      },
    },
  }
</script>

<style scoped>

</style>

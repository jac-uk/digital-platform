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

        <fieldset>
          <legend>Do you hold, or have you held in the past, a fee-paid judicial role?</legend>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="fee_paid_judicial_court" value="Fee-paid court post" v-model="applicant.fee_paid_judicial">
            <label class="custom-control-label" for="fee_paid_judicial_court">
              Fee-paid court post
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="fee_paid_judicial_tribunal" value="Fee-paid tribunal post" v-model="applicant.fee_paid_judicial">
            <label class="custom-control-label" for="fee_paid_judicial_tribunal">
              Fee-paid tribunal post
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="fee_paid_judicial_jo" value="Other fee-paid judicial office holder" v-model="applicant.fee_paid_judicial">
            <label class="custom-control-label" for="fee_paid_judicial_jo">
              Other fee-paid judicial office holder
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="fee_paid_judicial_no" value="I have not previously held a fee-paid role" v-model="applicant.fee_paid_judicial">
            <label class="custom-control-label" for="fee_paid_judicial_no">
              I have not previously held a fee-paid role
            </label>
          </div>
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="fee_paid_judicial_no_answer" value="I prefer not to answer this question" v-model="applicant.fee_paid_judicial">
            <label class="custom-control-label" for="fee_paid_judicial_no_answer">
              I prefer not to answer this question
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>What is your ethnic group?</legend>

          <section class="mb-3">
            <h6>White</h6>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_white_british" value="English, Welsh, Scottish, Northern Ireland, British" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_white_british">
                English, Welsh, Scottish, Northern Ireland, British
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_white_irish" value="Irish" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_white_irish">
                Irish
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_white_gypsy" value="Gypsy or Irish Traveller" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_white_gypsy">
                Gypsy or Irish Traveller
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_white_other" value="Any other White background" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_white_other">
                Any other White background
              </label>
            </div>
          </section>

          <section class="mb-3">
            <h6>Mixed/multiple ethnic backgrounds</h6>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_mixed_caribbean" value="White and Black Caribbean" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_mixed_caribbean">
                White and Black Caribbean
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_mixed_african" value="White and Black African" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_mixed_african">
                White and Black African
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_mixed_asian" value="White and Asian" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_mixed_asian">
                White and Asian
              </label>
            </div>
          </section>

          <section class="mb-3">
            <h6>Any other mixed/multiple ethinic background</h6>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other_mixed_asian" value="Asian/Asian British" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other_mixed_asian">
                Asian/Asian British
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other_mixed_indian" value="Indian" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other_mixed_indian">
                Indian
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other_mixed_pakistani" value="Pakistani" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other_mixed_pakistani">
                Pakistani
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other_mixed_bangladeshi" value="Bangladeshi" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other_mixed_bangladeshi">
                Bangladeshi
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other_mixed_chinese" value="Chinese" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other_mixed_chinese">
                Chinese
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other_mixed_other" value="Any other Asian background" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other_mixed_other">
                Any other Asian background
              </label>
            </div>
          </section>

          <section class="mb-3">
            <h6>Black/African/Caribbean/Black British</h6>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_african_african" value="African" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_african_african">
                African
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_african_caribbean" value="Caribbean" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_african_caribbean">
                Caribbean
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_african_other" value="Any other Black/African/Caribbean background" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_african_other">
                Any other Black/African/Caribbean background
              </label>
            </div>
          </section>

          <section class="mb-3">
            <h6>Other ethnic group</h6>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other_arab" value="Arab" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other_arab">
                Arab
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_other" value="Other" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_other">
                Other
              </label>
            </div>
            <div class="custom-control custom-radio">
              <input class="custom-control-input" type="radio" id="ethnicity_no_answer" value="I prefer not to answer this question" v-model="applicant.ethnicity">
              <label class="custom-control-label" for="ethnicity_no_answer">
                I prefer not to answer this question
              </label>
            </div>
          </section>
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
      if (!applicant.fee_paid_judicial) {
        applicant.fee_paid_judicial = [];
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

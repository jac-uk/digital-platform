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
          <SelectList id="professional_background" :multiple="true" :options="selectListOptions.professionalBackground" v-model="applicant.professional_background" />
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
          <SelectList id="current_legal_role" :multiple="true" :options="selectListOptions.currentLegalRole" v-model="applicant.current_legal_role" />
          <div class="custom-control custom-checkbox">
            <input class="custom-control-input" type="checkbox" id="current_legal_role_other" :value="true" v-model="applicant.current_legal_role_has_other">
            <label class="custom-control-label" for="current_legal_role_other">
              Other (please specify)
            </label>
            <input v-if="applicant.current_legal_role_has_other" type="text" class="form-control" v-model="applicant.current_legal_role_other">
          </div>
        </fieldset>

        <fieldset>
          <legend>Do you hold, or have you held in the past, a fee-paid judicial role?</legend>
          <SelectList id="fee_paid_judicial_role" :multiple="true" :options="selectListOptions.feePaidJudicialRole" v-model="applicant.fee_paid_judicial" />
        </fieldset>

        <fieldset>
          <legend>What is your ethnic group?</legend>
          <h6>White</h6>
          <SelectList id="ethnicity_white" :options="selectListOptions.ethnicities.white" :multiple="false" v-model="applicant.ethnicity" />
          <h6 class="mt-3">Mixed/multiple ethnic backgrounds</h6>
          <SelectList id="ethnicity_mixed" :options="selectListOptions.ethnicities.mixed" :multiple="false" v-model="applicant.ethnicity" />
          <h6 class="mt-3">Any other mixed/multiple ethinic background</h6>
          <SelectList id="ethnicity_other_mixed" :options="selectListOptions.ethnicities.otherMixed" :multiple="false" v-model="applicant.ethnicity" />
          <h6 class="mt-3">Black/African/Caribbean/Black British</h6>
          <SelectList id="ethnicity_black" :options="selectListOptions.ethnicities.black" :multiple="false" v-model="applicant.ethnicity" />
          <h6 class="mt-3">Other ethnic group</h6>
          <SelectList id="ethnicity_other" :options="selectListOptions.ethnicities.other" :multiple="false" v-model="applicant.ethnicity" />
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
  import SelectList from '@/components/SelectList';

  export default {
    name: 'Diversity',
    components: {
      SelectList,
    },
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        isSaving: false,
        selectListOptions: {
          professionalBackground: [
            'Solicitor',
            'Barrister',
            'CILEx',
            'I prefer not to answer this question',
          ],
          currentLegalRole: [
            'Academic',
            'Barrister',
            'Fee-paid court judge',
            'Fee-paid tribunal judge',
            'Fellow of CILEx',
            'Other fee-paid judicial office holder',
            'Other salaried judicial office holder',
            'Salaried court judge',
            'Salaried tribunal judge',
            'Solicitor',
            'I prefer not to answer this question',
          ],
          feePaidJudicialRole: [
            'Fee-paid court post',
            'Fee-paid tribunal post',
            'Other fee-paid judicial office holder',
            'I have not previously held a fee-paid role',
            'I prefer not to answer this question',
          ],
          ethnicities: {
            white: [
              'English, Welsh, Scottish, Northern Ireland, British',
              'Irish',
              'Gypsy or Irish Traveller',
              'Any other White background',
            ],
            mixed: [
              'White and Black Caribbean',
              'White and Black African',
              'White and Asian',
            ],
            otherMixed: [
              'Asian/Asian British',
              'Indian',
              'Pakistani',
              'Bangladeshi',
              'Chinese',
              'Any other Asian background',
            ],
            black: [
              'African',
              'Caribbean',
              'Any other Black/African/Caribbean background',
            ],
            other: [
              'Arab',
              'Other',
              'I prefer not to answer this question',
            ],
          },
        },
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

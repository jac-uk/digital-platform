<template>
  <section>
    <form @submit.prevent="save">
      <h2>Diversity</h2>

      <p>The JAC will use the information that you provide in 2 ways:</p>
      <ol>
        <li>where the <a href="https://www.judicialappointments.gov.uk/equal-merit-provision" target="_blank">Equal Merit Provision policy</a> applies</li>
        <li>to monitor the selection process</li>
      </ol>
      <p>Find out <a href="https://www.judicialappointments.gov.uk/providing-diversity-information-jac" target="_blank">more information on the JAC website</a></p>

      <fieldset>
        <legend>Sharing my diversity data</legend>
          <SelectList id="sharing_consent" :options="selectListOptions.sharingConsent" v-model="applicant.diversity_sharing_consent" />
      </fieldset>

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
        <SelectList id="ethnicity_white" :options="selectListOptions.ethnicities.white" v-model="applicant.ethnicity" />
        <h6 class="mt-3">Mixed/multiple ethnic backgrounds</h6>
        <SelectList id="ethnicity_mixed" :options="selectListOptions.ethnicities.mixed" v-model="applicant.ethnicity" />
        <h6 class="mt-3">Any other mixed/multiple ethinic background</h6>
        <SelectList id="ethnicity_other_mixed" :options="selectListOptions.ethnicities.otherMixed" v-model="applicant.ethnicity" />
        <h6 class="mt-3">Black/African/Caribbean/Black British</h6>
        <SelectList id="ethnicity_black" :options="selectListOptions.ethnicities.black" v-model="applicant.ethnicity" />
        <h6 class="mt-3">Other ethnic group</h6>
        <SelectList id="ethnicity_other" :options="selectListOptions.ethnicities.other" v-model="applicant.ethnicity" />
      </fieldset>

      <fieldset>
        <legend>What is your sex?</legend>
        <SelectList id="sex" :options="selectListOptions.sex" v-model="applicant.sex" />
      </fieldset>

      <fieldset>
        <legend>Is your gender identity the same as the sex you were assigned at birth?</legend>
        <SelectList id="gender" :options="selectListOptions.yesNo" v-model="applicant.gender_matches_sex" />
      </fieldset>

      <fieldset>
        <legend>How would you describe your sexual orientation?</legend>
        <SelectList id="sexual_orientation" :options="selectListOptions.sexualOrientation" v-model="applicant.sexual_orientation" />
      </fieldset>

      <fieldset>
        <legend>Do you have a disability, as defined by the Equality Act 2010?</legend>
        <SelectList id="disability" :options="selectListOptions.yesNo" v-model="applicant.disability" />
      </fieldset>

      <fieldset>
        <legend>What is your religion or belief?</legend>
        <SelectList id="religion" :options="selectListOptions.religion" v-model="applicant.religion" />
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="religion_other" value="Other" v-model="applicant.religion">
          <label class="custom-control-label" for="religion_other">
            Other (please specify)
          </label>
          <input v-if="applicant.religion === 'Other'" type="text" class="form-control" v-model="applicant.religion_other">
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
        selectListOptions: {
          sharingConsent: [
            {value: true, label: 'You may share my diversity data with the Ministry of Justice, Judicial Office and HM Courts and Tribunals Service (for monitoring purposes only)'},
            {value: false, label: 'Do NOT share my diversity data'},
          ],
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
          sex: [
            'Male',
            'Female',
            'Other (e.g. Transgender)',
            'I prefer not to answer this question',
          ],
          yesNo: [
            'Yes',
            'No',
            'I prefer not to answer this question',
          ],
          sexualOrientation: [
            'Bisexual',
            'Gay man',
            'Gay woman/ lesbian',
            'Heterosexual/ straight',
            'Other',
            'I prefer not to answer this question',
          ],
          religion: [
            'Atheist',
            'Buddhist',
            'Christian',
            'Hindu',
            'Jewish',
            'Muslim',
            'No religion',
            'Sikh',
            'I prefer not to answer this question',
          ],
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

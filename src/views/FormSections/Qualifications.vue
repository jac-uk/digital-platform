<template>
  <section>
    <form @submit.prevent="save">
      <h2>Your qualifications</h2>

      <fieldset>
        <legend>What are your qualifications?</legend>
        <RepeatableFields v-model="applicant.qualifications" :component="repeatableFields.Qualification" />
      </fieldset>

      <fieldset>
        <legend>What are you qualified as?</legend>
        <SelectList :options="selectListOptions.qualifiedProfessions" :multiple="false" v-model="applicant.qualified_profession" id="qualified_profession" />
      </fieldset>

      <fieldset>
        <legend>Where did you qualify?</legend>
        <SelectList :options="selectListOptions.qualifiedLocations" v-model="applicant.location_qualified" id="location_qualified" />
      </fieldset>

      <div v-if="applicant.qualified_profession === 'Solicitor'">
        <fieldset>
          <legend>When were you admitted as a solicitor?</legend>
          <div class="fieldset-text">For example, 02 2017</div>
          <DateInput v-model="applicant.solicitor_date_admitted" />
        </fieldset>

        <fieldset>
          <legend>Are you currently on the roll?</legend>
          <BooleanInput v-model="applicant.solicitor_currently_on_roll" />
        </fieldset>
      </div>

      <div v-if="applicant.qualified_profession === 'Advocate'">
        <fieldset>
          <legend>When were you called to the Faculty?</legend>
          <div class="fieldset-text">For example, 02 2017</div>
          <DateInput v-model="applicant.advocate_date_called_to_faculty" />
        </fieldset>
      </div>

      <div v-if="applicant.qualified_profession === 'Barrister'">
        <fieldset>
          <legend>When were you called to the Bar?</legend>
          <div class="fieldset-text">For example, 02 2017</div>
          <DateInput v-model="applicant.barrister_date_called_to_bar" />
        </fieldset>

        <div v-if="applicant.location_qualified !== 'Northern Ireland'">
          <fieldset>
            <legend>Pupillage</legend>
            <p>Have you completed pupillage?</p>
            <BooleanInput v-model="applicant.barrister_completed_pupillage" />

            <div v-if="applicant.barrister_completed_pupillage" class="mt-3">
              <p>When did you complete pupillage?</p>
              <div class="fieldset-text">For example, 02 2017</div>
              <DateInput v-model="applicant.barrister_date_completed_pupillage" />
            </div>

            <div v-if="!applicant.barrister_completed_pupillage" class="mt-3">
              <p>Why didn’t you complete pupillage?</p>
              <textarea class="form-control" v-model="applicant.barrister_reason_pupillage_not_completed" rows="3"></textarea>
              <p class="mt-3">Do you have an exemption certificate?</p>
              <BooleanInput v-model="applicant.barrister_has_pupillage_exemption_certificate" />
              <p v-if="applicant.barrister_has_pupillage_exemption_certificate" class="mt-3">
                Email your certificate to <a href="mailto:jaas@jac.gsi.gov.uk">jaas@jac.gsi.gov.uk</a>
                quoting {{vacancy.jac_ref}}: {{vacancy.title}}
              </p>
            </div>
          </fieldset>
        </div>
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
  import DateInput from '@/components/DateInput';
  import SelectList from '@/components/SelectList';
  import BooleanInput from '@/components/BooleanInput';
  import RepeatableFields from '@/components/RepeatableFields';
  import Qualification from '@/views/RepeatableFields/Qualification';

  export default {
    name: 'Qualifications',
    components: {
      DateInput,
      SelectList,
      BooleanInput,
      RepeatableFields,
    },
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        vacancy: this.$store.getters.vacancy,
        isSaving: false,
        selectListOptions: {
          qualifiedProfessions: [
            {value: 'Barrister', label: 'A barrister'},
            {value: 'Solicitor', label: 'A solicitor'},
            {value: 'Advocate', label: 'An advocate'},
          ],
          qualifiedLocations: [
            'England and Wales',
            'Scotland',
            'Northern Ireland',
          ],
        },
        repeatableFields: {
          Qualification,
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
    }
  }
</script>

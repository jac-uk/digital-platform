<template>
  <section>
    <form @submit.prevent="save">
      <h2>Your experience</h2>

      <fieldset>
        <legend>Your experience</legend>
        <div class="fieldset-text">
          List your employment history, including any judicial appointments, starting with your most recent job
        </div>
        <RepeatableFields v-model="applicant.experience" :component="repeatableFields.Experience" />
      </fieldset>

      <fieldset>
        <legend>Have you had any gaps in employment since you qualified?</legend>
        <BooleanInput v-model="applicant.has_gaps_in_employment" />
        <div v-if="applicant.has_gaps_in_employment" class="mt-3">
          <label>What law-related activities did you do during this time, if any?</label>
          <div class="fieldset-text">Select all that apply</div>
          <SelectList :multiple="true" :options="selectListOptions.activities" v-model="applicant.gaps_in_employment_activities" id="gaps_in_employment_activities" />
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="gaps_in_employment_activities_other" v-model="applicant.gaps_in_employment_activities_has_other">
            <label class="custom-control-label" for="gaps_in_employment_activities_other">Other</label>
            <input v-if="applicant.gaps_in_employment_activities_has_other" type="text" class="form-control" v-model="applicant.gaps_in_employment_activities_other">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Have you had any work published?</legend>
        <BooleanInput v-model="applicant.has_published_work" class="mb-3" />
        <RepeatableFields v-if="applicant.has_published_work" v-model="applicant.published_work" :component="repeatableFields.PublishedWork" />
      </fieldset>

      <fieldset>
        <legend>Are you a member of any legal associations?</legend>
        <BooleanInput v-model="applicant.is_member_of_legal_associations" class="mb-3" />
        <RepeatableFields v-if="applicant.is_member_of_legal_associations" v-model="applicant.member_of_legal_associations" :component="repeatableFields.LegalAssociation" />
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
  import BooleanInput from '@/components/BooleanInput';
  import RepeatableFields from '@/components/RepeatableFields';
  import SelectList from '@/components/SelectList';
  import Experience from '@/views/RepeatableFields/Experience';
  import PublishedWork from '@/views/RepeatableFields/PublishedWork';
  import LegalAssociation from '@/views/RepeatableFields/LegalAssociation';

  export default {
    name: 'Experience',
    components: {
      BooleanInput,
      RepeatableFields,
      SelectList,
    },
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        isSaving: false,
        selectListOptions: {
          activities: [
            'Carrying out of judicial functions of any court or tribunals',
            'Acting as an arbitrator',
            'Practising or being employed as a lawyer',
            'Advising (whether or not in the course of such practice or employment as a lawyer) on the application of the law',
            'Assisting (whether or not in the course of such practice) persons involved in proceedings for the resolution of issues arising under the law',
            'Acting (whether or not in the course of such practice) as a mediator in connection with attempts to resolve issues that are the subject of proceedings or could be, if not resolved',
            'Drafting (whether or not in the course of such practice) documents intended to affect persons’ rights and obligations',
            'Teaching or researching law',
          ],
        },
        repeatableFields: {
          Experience,
          PublishedWork,
          LegalAssociation,
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

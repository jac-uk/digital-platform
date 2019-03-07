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
  import Experience from '@/views/RepeatableFields/Experience';
  import PublishedWork from '@/views/RepeatableFields/PublishedWork';
  import LegalAssociation from '@/views/RepeatableFields/LegalAssociation';

  export default {
    name: 'Experience',
    components: {
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

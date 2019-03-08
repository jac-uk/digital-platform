<template>
  <section>
    <form @submit.prevent="save">
      <h2>Your assessors</h2>

      <fieldset>
        <legend>Your assessors</legend>
        <div class="fieldset-text">Guidance on choosing your two assessors.</div>
        <RepeatableFields v-model="applicant.assessors" :component="repeatableFields.Assessor" :max="2" />
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
  import Assessor from '@/views/RepeatableFields/Assessor';
  import RepeatableFields from '@/components/RepeatableFields';

  export default {
    components: {
      RepeatableFields,
    },
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        vacancy: this.$store.getters.vacancy,
        isSaving: false,
        repeatableFields: {
          Assessor,
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

<template>
  <section>
    <form @submit.prevent="save">
      <h2>Your self assessment</h2>

      <fieldset>
        <legend>Additional Selection Criteria</legend>
        <div class="form-group">
          <label for="additional_selection_criteria">How do you meet this requirement?</label>
          <textarea class="form-control" id="additional_selection_criteria" rows="3" v-model="application.additional_selection_criteria"></textarea>
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
  import BooleanInput from '@/components/BooleanInput';

  export default {
    name: "SelfAssessment",
    components: {
      BooleanInput,
    },
    data() {
      return {
        application: this.$store.getters.application(),
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
        await this.$store.dispatch('saveApplication', this.application);
        this.isSaving = false;
      },
    }
  }
</script>

<style scoped>

</style>

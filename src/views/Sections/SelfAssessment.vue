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

      <fieldset>
        <legend>Authorisations</legend>
        <p>Do you currently have a Section 9(1) authorisation?</p>
        <BooleanInput v-model="application.has_section_9_1_authorisation" />
      </fieldset>

      <fieldset>
        <legend>Self Assessment</legend>
        <div class="fieldset-text">
          You may wish to refer to our guidance and the competency framework for this exercise before you complete this part of your application.
        </div>
        <div class="form-group">
          <label for="exercising_judgement">Exercising Judgement</label>
          <textarea class="form-control" id="exercising_judgement" rows="3" v-model="application.competency_exercising_judgement"></textarea>
        </div>
        <div class="form-group">
          <label for="possessing_and_building_knowledge">Possessing and Building Knowledge</label>
          <textarea class="form-control" id="possessing_and_building_knowledge" rows="3" v-model="application.competency_possessing_and_building_knowledge"></textarea>
        </div>
        <div class="form-group">
          <label for="assimilating_and_clarifying_information">Assimilating and Clarifying Information</label>
          <textarea class="form-control" id="assimilating_and_clarifying_information" rows="3" v-model="application.competency_assimilating_and_clarifying_information"></textarea>
        </div>
        <div class="form-group">
          <label for="working_and_communicating_with_others">Working and Communicating with others</label>
          <textarea class="form-control" id="working_and_communicating_with_others" rows="3" v-model="application.competency_working_and_communicating_with_others"></textarea>
        </div>
        <div class="form-group">
          <label for="managing_work_effectively">Managing Work Effectively</label>
          <textarea class="form-control" id="managing_work_effectively" rows="3" v-model="application.competency_managing_work_effectively"></textarea>
        </div>
      </fieldset>

      <SaveAndContinueButtons :isSaving="isSaving" @saveAndContinue="saveAndContinue" />
    </form>
  </section>
</template>

<script>
  import BooleanInput from '@/components/BooleanInput';
  import SaveAndContinueButtons from '@/components/SaveAndContinueButtons';

  export default {
    components: {
      SaveAndContinueButtons,
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

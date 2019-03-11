<template>
  <section>
    <form @submit.prevent="save">
      <h2>Declarations</h2>

      <fieldset>
        <legend>Are you related to, or known to any of the JAC Commissioners?</legend>
        <BooleanInput v-model="applicant.are_you_known_to_the_commissioners" />

        <div class="form-group mt-3" v-if="applicant.are_you_known_to_the_commissioners">
          <label for="known_to_commissioners">Select all the Commissioners that apply:</label>
          <SelectList id="known_to_commissioners" :multiple="true" :options="selectListOptions.known_to_commissioners" v-model="applicant.known_to_commissioners" />
        </div>
        <div class="form-group mt-3" v-if="applicant.are_you_known_to_the_commissioners">
          <label for="how_do_you_know_them_details">How do you know them?</label>
          <textarea id="how_do_you_know_them_details" class="form-control" v-model="applicant.how_do_you_know_the_commissioners" placeholder="Please provide details."></textarea>
        </div>
      </fieldset>
      <fieldset>
        <legend>Confidentiality</legend>
        <SelectList id="confidentiality" :multiple="true" :options="selectListOptions.confidentiality" v-model="applicant.confidentiality" />
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
import SelectList from '@/components/SelectList';

export default {
  name: 'Experience',
  components: {
    BooleanInput,
    SelectList
  },
  data() {
    return {
      applicant: this.$store.getters.applicant(),
      isSaving: false,
      selectListOptions: {
        known_to_commissioners: [
          'Professor Lord Ajay Kakkar, Chairman',
          'Lady Justice Rafferty, Vice Chairman',
          'Judge Mathu Asokan',
          'Her Honour Judge Anuja Dhir',
          'Emir Khan Feisal',
          'Jane Furniss CBE',
          'Andrew Kennon',
          'Sarah Lee',
          'Professor Noel Lloyd CBE',
          'Judge Fiona Monk',
          'Brie Stevens-Hoare',
          'Dame Valerie Strachan DCB',
          'His Honour Judge Phillip Sycamore',
          'Sir Simon Wessely',
          'Dame Philippa Whipple DBE'
        ],
        confidentiality: [
          'I undertake to maintain absolute confidentiality relating to all aspects of the selection process for this selection exercise.',
          'As I progress in the exercise I undertake to ensure that any relevant materials provided to me as part of the selection process are kept secure and not shared with anyone else.',
          'I understand that the Judicial Appointments Commission will automatically refer any suspected breach of this agreement to the Bar Standards Board, the Solicitors Regulatory Authority, CILEx Regulation, Judicial Conduct Investigations Office or other relevant regulatory body to consider as a potential breach of my professional obligations, or as misconduct, and this could result in disciplinary action by my regulator.',
          'I understand that the Judicial Appointments Commission takes very seriously the integrity of the selection process and any evidence that a candidate has breached this agreement might result in disqualification from this and future exercises.'
        ]
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

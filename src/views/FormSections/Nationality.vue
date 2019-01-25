<template>
  <section>
    <form @submit.prevent="saveAndContinue">
      <h2>Your Nationality</h2>
      <h3>Are you eligible to apply?</h3>
      <p>You need to be a citizen of:</p>
      <ul>
        <li>the United Kingdom, or</li>
        <li>another Commonwealth country, or</li>
        <li>the Republic of Ireland.</li>
      </ul>

      <div class="form-check">
        <input class="form-check-input" type="radio" name="exampleRadios" id="eligibility_na" value="na" v-model="applicant.eligible">
        <label class="form-check-label" for="eligibility_na">
          N/A
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="exampleRadios" id="eligibility_no" value="no" v-model="applicant.eligible">
        <label class="form-check-label" for="eligibility_no">
          No, I'm not eligible
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="exampleRadios" id="eligibility_yes" value="yes" v-model="applicant.eligible">
        <label class="form-check-label" for="eligibility_yes">
          Yes, I'm eligible
        </label>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary mr-2" type="submit">Save and Continue</button>
        <button class="btn btn-outline-secondary" @click.prevent="save">Save as Draft</button>
      </div>
    </form>
  </section>
</template>

<script>
  export default {
    name: "Nationality",
    props: {
      applicantDoc: Object,
      applicationDoc: Object,
    },
    data() {
      return {
        applicant: this.applicantDoc,
        application: this.applicationDoc,
      }
    },
    methods: {
      saveAndContinue() {
        console.log('Save and continue');
      },
      save() {
        console.log('Save');
      }
    }
  }
</script>

<style scoped>

</style>

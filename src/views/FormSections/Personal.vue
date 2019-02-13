<template>
  <section>
    <form @submit.prevent="save">
      <h2>Your Personal Details</h2>

      <fieldset>
        <legend>Your Name</legend>
        <div class="form-group">
          <label for="full_name">Full Name</label>
          <input type="text" class="form-control" id="full_name" v-model="applicant.full_name" autocomplete="name" placeholder="e.g. Mr John Smith">
        </div>
        <div class="form-group">
          <label for="preferred_name">Preferred Name</label>
          <input type="text" class="form-control" id="preferred_name" v-model="applicant.preferred_name" placeholder="e.g. John" style="max-width: 18rem;">
        </div>
        <div class="fieldset-text">
          We’ll use your preferred name when contacting you about your application.
        </div>
      </fieldset>

      <fieldset>
        <legend>Your Date of Birth</legend>
        <div class="fieldset-text">
          For example, 31 3 1980
        </div>
        <div class="form-row mb-3" style="max-width: 18rem;">
          <div class="col-3">
            <label for="dob_day">Day</label>
            <input type="number" min="1" max="31" step="1" class="form-control" id="dob_day" v-model="applicant.dob_day" placeholder="DD">
          </div>
          <div class="col-3">
            <label for="dob_month">Month</label>
            <input type="number" min="1" max="12" step="1" class="form-control" id="dob_month" v-model="applicant.dob_month" placeholder="MM">
          </div>
          <div class="col-6">
            <label for="dob_year">Year</label>
            <input type="number" min="1900" max="2019" step="1" class="form-control" id="dob_year" v-model="applicant.dob_year" placeholder="YYYY">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Your National Insurance Number</legend>
        <div class="fieldset-text">
          It’s on your National Insurance card, benefit letter, payslip or P60. For&nbsp;example, ‘QQ 12 34 56 C’.
        </div>
        <div class="form-group">
          <label for="national_insurance">National Insurance Number</label>
          <input type="text" class="form-control" id="national_insurance" v-model="applicant.national_insurance">
        </div>
      </fieldset>

      <fieldset>
        <legend>Your Nationality</legend>
        <div class="fieldset-text">
          We need to know your nationality to determine your eligibility for this role.
        </div>
        <details class="fieldset-text">
          <summary>Which nationalities are eligible for this role?</summary>
          <div>
            <p>To be eligible for this role, you need to be a citizen of:</p>
            <ul>
              <li>the United Kingdom, or</li>
              <li>another Commonwealth country, or</li>
              <li>the Republic of Ireland.</li>
            </ul>
            <p>Unfortunately other nationalities will not be considered for this role.</p>
          </div>
        </details>
        <p>I am a citizen of:</p>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_uk" value="United Kingdom" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_uk">
            the United Kingdom
          </label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_commonwealth" value="Commonwealth" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_commonwealth">
            another Commonwealth country
          </label>
          <select class="form-control" v-model="applicant.commonwealth_country" v-if="applicant.nationality == 'Commonwealth'">
            <option :value="undefined">Please specify...</option>
            <option v-for="country in commonwealthCountries" :value="country">
              {{country}}
            </option>
          </select>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_ireland" value="Republic of Ireland" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_ireland">
            the Republic of Ireland
          </label>
        </div>
        <div class="custom-control custom-radio">
          <input class="custom-control-input" type="radio" id="nationality_other" value="Other" v-model="applicant.nationality">
          <label class="custom-control-label" for="nationality_other">
            none of the above
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Your Contact Details</legend>
        <div class="fieldset-text">
          We’ll only use these details to contact you regarding your application.
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" class="form-control" id="email" v-model="applicant.email" autocomplete="email">
        </div>
        <div class="form-group">
          <label for="phone">Telephone Number</label>
          <input type="tel" class="form-control" id="phone" v-model="applicant.phone" autocomplete="tel">
        </div>
      </fieldset>

      <fieldset>
        <legend>Your Address</legend>
        <div class="fieldset-text">
          We need your address to verify your identity when we perform character checks.
        </div>
        <div class="form-group">
          <label for="address_line_1">
            Address
            <span class="sr-only">line 1 of 2</span>
          </label>
          <input type="text" class="form-control" id="address_line_1" v-model="applicant.address_line_1" autocomplete="address-line1">
        </div>
        <div class="form-group">
          <label for="address_line_2" class="sr-only">
            Address line 2 of 2
          </label>
          <input type="text" class="form-control" id="address_line_2" v-model="applicant.address_line_2" autocomplete="address-line2">
        </div>
        <div class="form-group">
          <label for="address_town">
            Town or City
          </label>
          <input type="text" class="form-control" id="address_town" v-model="applicant.address_town" autocomplete="address-line2" style="max-width: 18rem;">
        </div>
        <div class="form-group">
          <label for="address_county">
            County
          </label>
          <input type="text" class="form-control" id="address_county" v-model="applicant.address_county" autocomplete="address-level1" style="max-width: 18rem;">
        </div>
        <div class="form-group">
          <label for="address_postcode">
            Postcode
          </label>
          <input type="text" class="form-control" id="address_postcode" v-model="applicant.address_postcode" autocomplete="postal-code" style="max-width: 12rem;">
        </div>
      </fieldset>

      <fieldset>
        <legend>Reasonable Adjustments</legend>
        <div class="fieldset-text">
          We provide reasonable adjustments to ensure that disabled candidates are not placed at a substantial disadvantage. We’ll also consider making reasonable adjustments for those suffering from short-term injury or temporary illness.
        </div>

        <p>Do you need any reasonable adjustments?</p>

        <div class="custom-control custom-radio custom-control-inline">
          <input class="custom-control-input" type="radio" id="reasonable_adjustments_yes" :value="true" v-model="applicant.reasonable_adjustments">
          <label class="custom-control-label" for="reasonable_adjustments_yes">
            Yes
          </label>
        </div>
        <div class="custom-control custom-radio custom-control-inline">
          <input class="custom-control-input" type="radio" id="reasonable_adjustments_no" :value="false" v-model="applicant.reasonable_adjustments">
          <label class="custom-control-label" for="reasonable_adjustments_no">
            No
          </label>
        </div>

        <div class="form-group mt-3" v-if="applicant.reasonable_adjustments">
          <label for="reasonable_adjustments_details">
            Details of Request
          </label>
          <textarea class="form-control" id="reasonable_adjustments_details" v-model="applicant.reasonable_adjustments_details" rows="3" placeholder="Please provide details of your condition and request"></textarea>
          <div class="form-text">
            <p>We’ll contact you if we need to discuss your arrangements.</p>
            <p>If you would like to discuss reasonable adjustments in confidence with someone, please telephone us on 020 3334 0123 or email <a href="mailto:reasonableadjustments@jac.gsi.gov.uk">reasonableadjustments@jac.gsi.gov.uk</a>.</p>
          </div>
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
  import commonwealthCountries from '@/datalists/commonwealth-countries';

  export default {
    name: "Personal",
    data() {
      return {
        applicant: this.$store.getters.applicant(),
        isSaving: false,
        commonwealthCountries,
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

<style scoped>

</style>

<template>
  <section class="card mb-3">
    <div class="card-header">
      <h3 class="card-title">Your Qualifications</h3>
    </div>

    <div class="card-body">
    <table class="table">
      <tbody>
        <tr v-for="qualification in applicant.qualifications" :key="qualification.id">
          <th scope="row">Qualification</th>
          <td>
            {{ qualification.qualification }}<br />
            {{ qualification.college }}<br />
            {{ qualification.date.toLocaleDateString() }}
          </td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr>
          <th scope="row">Qualified Profession</th>
          <td>{{ applicant.qualified_profession }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr>
          <th scope="row">Where did you qualify?</th>
          <td>{{ applicant.location_qualified }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.solicitor_date_admitted">
          <th scope="row">When were you admitted as a solicitor?</th>
          <td>{{ applicant.solicitor_date_admitted.toLocaleDateString() }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.solicitor_currently_on_roll">
          <th scope="row">Are you currently on the roll?</th>
          <td>{{ applicant.solicitor_currently_on_roll }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.advocate_date_called_to_faculty">
          <th scope="row">Are you currently on the roll?</th>
          <td>{{ applicant.advocate_date_called_to_faculty.toLocaleDateString() }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.advocate_date_called_to_faculty">
          <th scope="row">Are you currently on the roll?</th>
          <td>{{ applicant.advocate_date_called_to_faculty.toLocaleDateString() }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.barrister_date_called_to_bar">
          <th scope="row">When were you called to the Bar?</th>
          <td>{{ applicant.barrister_date_called_to_bar.toLocaleDateString() }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.barrister_date_called_to_bar">
          <th scope="row">When were you called to the Bar?</th>
          <td>{{ applicant.barrister_date_called_to_bar.toLocaleDateString() }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.barrister_completed_pupillage">
          <th scope="row">Have you completed pupilage?</th>
          <td>{{ applicant.barrister_completed_pupillage }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.barrister_reason_pupillage_not_completed">
          <th scope="row">Why didn't you complete pupilage?</th>
          <td>{{ applicant.barrister_reason_pupillage_not_completed }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
        <tr v-if="applicant.barrister_has_pupillage_exemption_certificate">
          <th scope="row">Do you have an exemption certificate?</th>
          <td>{{ applicant.barrister_has_pupillage_exemption_certificate ? "Yes" : "No" }}</td>
          <td>
            <RouterLink to="/apply/qualifications">Change</RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      applicant: this.$store.getters.applicant(),
      vacancy: this.$store.getters.vacancy,
      isSaving: false
    };
  }
}
</script>

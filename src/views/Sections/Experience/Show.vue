<template>
  <section class="card mb-3">
    <div class="card-header">
      <h3 class="card-title">Your Experience</h3>
    </div>

    <div class="card-body">
      <table class="table mb-3" v-for="exp in applicant.experience" :key="exp.id">
        <tbody>
          <tr>
            <th>Title:</th>
            <td>{{ exp.title }}</td>
          </tr>
          <tr>
            <th>Current Role:</th>
            <td>{{ exp.currently_in_job ? "Yes" : "No"}}</td>
          </tr>
          <tr v-if="exp.appointment_type">
            <th>Appointment Type:</th>
            <td>{{ exp.appointment_type }}</td>
          </tr>
          <tr v-if="exp.date_from">
            <th>Date From:</th>
            <td>{{ exp.date_from.toLocaleDateString() }}</td>
            <tr v-if="exp.date_to">
              <th>Date To:</th>
              <td>{{ exp.date_to.toLocaleDateString() }}</td>
            </tr>
            <tr v-if="exp.circuit">
              <th>Circuit:</th>
              <td>{{ exp.circuit }}</td>
            </tr>
            <tr v-if="exp.jurisdiction">
              <th>Jurisdiction:</th>
              <td>{{ exp.jurisdiction }}</td>
            </tr>
            <tr v-if="exp.region">
              <th>Region:</th>
              <td>{{ exp.region }}</td>
            </tr>
            <tr>
              <td colspan="10">
                <RouterLink to="/apply/experience" class="float-right">Change</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>

        <table class="table">
          <tbody>
            <tr>
              <th scope="row">Have you had and gaps in employment?</th>
              <td>{{ applicant.has_gaps_in_employment ? "Yes" : "No" }}</td>
              <td>
                <RouterLink to="/apply/experience">Change</RouterLink>
              </td>
            </tr>
            <tr v-for="gap in applicant.gaps_in_employment_activities" :key="gap.id">
              <td scope="row">{{ gap }}</td>
              <td>Yes</td>
              <td><RouterLink to="/apply/experience">Change</RouterLink></td>
            </tr>
            <tr v-if="applicant.gaps_in_employment_activities_has_other">
              <th scope="row">Other</th>
              <td>{{ applicant.gaps_in_employment_activities_other }}</td>
              <td><RouterLink to="/apply/experience">Change</RouterLink></td>
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
    };
  }
}
</script>

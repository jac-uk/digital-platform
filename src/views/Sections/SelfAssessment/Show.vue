<template>
  <section class="card mb-3">
    <div class="card-header">
      <h3 class="card-title">Your Self Assessment</h3>
    </div>

    <div class="card-body">
      <table class="table">
        <tbody>
          <tr>
            <th scope="row">Additional Selection Criteria</th>
            <td>{{ application.additional_selection_criteria}}</td>
            <td>
              <RouterLink to="/apply/self-assessment">Change</RouterLink>
            </td>
          </tr>
          <tr>
            <th scope="row">Section 9(1) authorisation</th>
            <td>{{ application.has_section_9_1_authorisation ? "Yes" : "No" }}</td>
            <td>
              <RouterLink to="/apply/self-assessment">Change</RouterLink>
            </td>
          </tr>
          <tr>
            <th scope="row">Exercising Judgement</th>
            <td>{{ application.competency_exercising_judgement }}</td>
            <td>
              <RouterLink to="/apply/self-assessment">Change</RouterLink>
            </td>
          </tr>
          <tr>
            <th scope="row">Possessing and Building Knowledge</th>
            <td>{{ application.competency_possessing_and_building_knowledge }}</td>
            <td>
              <RouterLink to="/apply/self-assessment">Change</RouterLink>
            </td>
          </tr>
          <tr>
            <th scope="row">Assimilating and Clarifying Information</th>
            <td>{{ application.competency_assimilating_and_clarifying_information }}</td>
            <td>
              <RouterLink to="/apply/self-assessment">Change</RouterLink>
            </td>
          </tr>
          <tr>
            <th scope="row">Working and Communicating with others</th>
            <td>{{ application.competency_working_and_communicating_with_others }}</td>
            <td>
              <RouterLink to="/apply/self-assessment">Change</RouterLink>
            </td>
          </tr>
          <tr>
            <th scope="row">Managing Work Effectively</th>
            <td>{{ application.competency_managing_work_effectively }}</td>
            <td>
              <RouterLink to="/apply/self-assessment">Change</RouterLink>
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
        application: this.$store.getters.application(),
      };
    }
  }
</script>

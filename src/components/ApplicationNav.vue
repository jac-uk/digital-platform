<template>
  <ol class="nav nav-pills flex-column">
    <li class="nav-item">
      <RouterLink to="/apply" class="nav-link" active-class="active" exact>Introduction</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/nationality" class="nav-link" active-class="active">Nationality</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/personal" class="nav-link" active-class="active">Personal Details</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/qualifications" class="nav-link" active-class="active">Qualifications</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/experience" class="nav-link" active-class="active">Experience</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/self-assessment" class="nav-link" active-class="active">Self Assessment</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/character" class="nav-link" active-class="active">Character</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/preferences" class="nav-link" active-class="active">Preferences</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/diversity" class="nav-link" active-class="active">Diversity</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink to="/apply/outreach" class="nav-link" active-class="active">Outreach</RouterLink>
    </li>
  </ol>
</template>

<script>
  export default {
    name: 'ApplicationNav'
  }
</script>

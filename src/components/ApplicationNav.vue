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
  </ol>
</template>

<script>
  export default {
    name: "ApplicationNav"
  }
</script>

<style scoped>

</style>

<template>
  <div id="app" class="container-fluid">
    <h1>Application Form</h1>
    <ApplicationForm/>
  </div>
</template>

<script>
import ApplicationForm from './components/ApplicationForm'

export default {
  name: 'app',
  components: {
    ApplicationForm
  }
}
</script>

<style>
#app {
  max-width: 600px;
}
</style>

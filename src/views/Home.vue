<template>
  <div>
    <h1>Application Form</h1>
    <ApplicationForm :userId="authUser.uid"/>
  </div>
</template>

<script>
  import ApplicationForm from '../components/ApplicationForm';

  export default {
    name: "Home",
    props: {
      authUser: Object,
    },
    components: {
      ApplicationForm,
    }
  }
</script>

<style scoped>

</style>

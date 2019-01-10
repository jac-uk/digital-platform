<template>
  <div>{{msg}}</div>
</template>

<script>
  export default {
    name: "HelloWorld",
    props: {
      msg: String
    },
    methods: {
      dummy() {
        return 'I only exist to enable test coverage';
      }
    }
  }
</script>

<style scoped>

</style>

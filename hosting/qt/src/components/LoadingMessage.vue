<template>
  <div>
    <div ref="loadingMessage" v-if="!loadfailed">
      <span class="spinner-border spinner-border-sm text-secondary"></span>
      Loading...
    </div>
    <div ref="errorMessage" v-else>
      <p>Could not load data. Please reload the page and try again.</p>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      loadfailed: Boolean,
    },
  };
</script>

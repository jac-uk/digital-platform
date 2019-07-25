<template>
  <div>
    <div
      v-if="!loadFailed"
      ref="loadingMessage"
    >
      <span class="spinner-border spinner-border-sm text-secondary" />
      Loading...
    </div>
    <div
      v-else
      ref="errorMessage"
    >
      <p>Could not load data. Please reload the page and try again.</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    loadFailed: Boolean,
  },
};
</script>

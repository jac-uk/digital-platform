<template>
  <div
    v-if="isIE"
    class="alert alert-danger mt-5 mb-5"
    role="alert"
  >
    <h4>Warning</h4>
    <p><strong>You’re using Internet Explorer.</strong></p>
    <p>The test will not work correctly on this browser – use Chrome, Firefox or Microsoft Edge instead.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Detect whether we're in Internet Explorer by checking for the existence of `document.documentMode`
      // `document.documentMode` is only present in IE. For every other browser it's undefined.
      isIE: !!document.documentMode,
    };
  },
};
</script>

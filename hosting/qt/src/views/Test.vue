<template>
  <main>
    <div class="container">
      <div class="breadcrumb">
        <button class="breadcrumb-item ative" @click="leaveThePage">Go back to My Tests page</button>
      </div>
    </div>
    <div class="iframe-conainer">
      <iframe id="inlineFrameExample"
        title="Inline Frame Example"
        width="100%"
        height="100%"
        frameborder="0"
        v-bind:src="this.testFormUrl">
    </iframe>
    </div>
  </main>
</template>

<script>
  import TakeTest from '@/views/TakeTest';
  import { mapGetters } from 'vuex';

  export default {
    data() {
      return {
        loaded: false,
        loadFailed: false,
        isStarting: false,
      };
    },
    computed: {
      ...mapGetters([
        'testFormUrl',
      ]),
    },
    methods: {
      leaveThePage() {
        if (confirm('If you leave this page the progress will be lost. Do you want to leave the page?')) {
          this.$router.push('/take-test');
        } else {
          return;
        }
        
      },
    },
  };
</script>

<style scoped>
  .iframe-conainer {
    height: 100%;
  }

  button.breadcrumb-item {
    border: none;
    background: transparent;
    text-decoration: underline;
  }
</style>


<template>
  <main>
    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <button
          id="goBack-btn"
          class="breadcrumb-item ative"
          @click="leaveThePage"
        >
          Go back to My Tests page
        </button>
      </div>
    </div>

    <LoadingMessage
      v-if="loaded === false"
      ref="loadingMessageComponent"
      :load-failed="loadFailed"
    />

    <div 
      v-else
      class="iframe-container"
    >
      <iframe
        v-if="authorizedForView"
        :src="testFormUrl"
      />

      <div 
        v-else
        ref="alert"
        class="alert alert-danger"
      >
        The test is not available
      </div>
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex';
import loadTestData from '@/helpers/loadTestData';
import LoadingMessage from '@/components/LoadingMessage';

export default {
  components: {
    LoadingMessage,
  },
  data() {
    return {
      loadFailed: false,
      loaded: false,
      authorizedForView: false,
    };
  },
  computed: {
    ...mapGetters([
      'testFormUrl',
      'testIsOpen',
      'userHasStartedTest',
      'userHasFinishedTest',
    ]),
  },
  mounted() {
    // update the value of authorizedForView
    if(this.testIsOpen !== null && this.userHasStartedTest !== null && this.userHasFinishedTest !== null) {
      this.authorizedForView = this.isAuthorised();
    }

    this.loaded = this.testFormUrl ? true : false;

    if(!this.loaded) {
      loadTestData(this.$store, this.$route).then(() => {
        this.loaded = true;
        // update authorizedForView after loadTestData
        this.authorizedForView = this.isAuthorised();
      })
        .catch((e) => {
          this.loadFailed = true;
          throw e;
        });
    }
  },
  methods: {
    leaveThePage() {
      if (confirm('If you leave this page the progress will be lost. Do you want to leave the page?')) {
        this.$router.go(-1);
      }
    },
    isAuthorised() {
      return this.testIsOpen && this.userHasStartedTest && !this.userHasFinishedTest;
    },
  },
};
</script>

<style scoped>
  .iframe-container {
    height: 100%;
    flex-grow: 1;
  }

  button.breadcrumb-item {
    border: none;
    background: transparent;
    text-decoration: underline;
  }

  main {
    display: flex;
    flex-direction: column;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>


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
      :load-failed="loadFailed"
    />
    
    <div class="iframe-conainer">
      <iframe
        width="100%"
        height="100%"
        style="border:none"
        :src="testFormUrl"
      />
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
    };
  },
  computed: {
    ...mapGetters([
      'testFormUrl',
    ]),
  },
  mounted() {
    this.loaded = this.testFormUrl ? true : false;

    if(!this.loaded) {
      loadTestData(this.$store, this.$route).then(() => {

        this.loaded = true;
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

  main {
    display: flex;
    flex-direction: column;
  }

  .iframe-conainer {
    flex-grow: 1;
  }


</style>


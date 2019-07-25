<template>
  <main>
    <LoadingMessage v-if="loaded === false" loadFailed="loadFailed" />

    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <button class="breadcrumb-item ative" @click="leaveThePage" id="goBack-btn">Go back to My Tests page</button>
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
  import { mapGetters } from 'vuex';
  import loadTestData from '@/utils/helpers/loadTestData';
  import LoadingMessage from '@/components/LoadingMessage';

  export default {
    components: {
      LoadingMessage,
    },
    data() {
      return {
        loaded: this.testFormUrl,
        loadFailed: false,
      };
    },
    computed: {
      ...mapGetters([
        'testFormUrl'
      ]),
    },
    mounted() {
      const formUrlExistsInState = this.testFormUrl;

      if(!formUrlExistsInState) {
        loadTestData(this.$store, this.$route).then((result) => {
        if(result) {
          this.loaded = true;
          return;
        }
        else {
          this.loadFailed = true;
        }
      });
      }
    },
    methods: {
      leaveThePage() {
        if (confirm('If you leave this page the progress will be lost. Do you want to leave the page?')) {
          console.log("THIS IS");
          this.$router.go(-1);
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

  main {
    display: flex;
    flex-direction: column;
  }

  .iframe-conainer {
    flex-grow: 1;
  }


</style>


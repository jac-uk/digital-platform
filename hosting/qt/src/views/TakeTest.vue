<template>
  <main>
    <div class="breadcrumb-container">
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
import { mapGetters } from 'vuex';
import TestCard from '@/components/TestCard';
import TestWindow from '@/components/TestWindow';
import IEWarning from '@/components/IEWarning';

export default {
  components: {
    TestCard,
    TestWindow,
    IEWarning,
  },
  data() {
    return {
      loaded: false,
      loadFailed: false,
      isStarting: false,
    };
  },
  computed: {
    ...mapGetters([
      'test',
      'testHasClosed',
      'userHasFinishedTest',
    ]),
  },
  watch: {
    '$route' () {
      this.loaded = false;
      this.loadFailed = false;
      this.$store.dispatch('unsubscribeUserTest');
      this.loadTestData();
    },
  },
  mounted() {
    this.loadTestData();
  },
  destroyed() {
    this.$store.dispatch('unsubscribeUserTest');
  },
  methods: {
    loadTestData() {
      this.$store.commit('setTestId', this.$route.params.id);
      return Promise.all([
        this.$store.dispatch('loadTest'),
        this.$store.dispatch('loadUserTest'),
      ])
        .then(() => {
          this.loaded = true;
          this.$store.dispatch('subscribeUserTest');
        })
        .catch((e) => {
          this.loadFailed = true;
          throw e;
        });
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


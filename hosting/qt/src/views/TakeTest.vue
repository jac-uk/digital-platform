<template>
  <main class="container">
    <h1>Take a qualifying test</h1>

    <IEWarning />

    <div
      v-if="loaded === false && loadFailed === false"
      ref="loadingMessage"
    >
      <span
        class="spinner-border spinner-border-sm text-secondary"
        aria-hidden="true"
      />
      Loading...
    </div>

    <div
      v-if="loaded === false && loadFailed === true"
      ref="errorMessage"
    >
      <p>Could not load data. Please reload the page and try again.</p>
    </div>

    <div
      v-if="loaded === true"
      ref="qtView"
    >
      <h4>{{ test.vacancyTitle }}</h4>

      <TestWindow />

      <div v-if="!testHasClosed && !userHasFinishedTest">
        <h5>Do’s and don’ts</h5>
        <ul>
          <li><strong>Do</strong> make sure you’ve got a stable internet connection before you start</li>
          <li><strong>Don’t</strong> press the back button at any point</li>
          <li><strong>Don’t</strong> close the test window until you’ve submitted your answers</li>
        </ul>

        <h5>Timing</h5>
        <ul>
          <li>You have <strong>45 minutes</strong> to complete the test and must manage the time yourself</li>
          <li>Time starts when you click ‘start test’ and stops when you click ‘submit’</li>
          <li>Your answers won’t be marked if you submit after 45 minutes</li>
        </ul>
      </div>

      <TestCard
        v-if="!testHasClosed"
        class="mt-4"
      />
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
};
</script>

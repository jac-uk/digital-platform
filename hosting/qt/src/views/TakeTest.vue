<template>
  <main class="container">
    <h1>Take a qualifying test</h1>

    <div ref="loadingMessage" v-if="loaded === false && loadFailed === false">
      <span class="spinner-border spinner-border-sm text-secondary" aria-hidden="true"></span>
      Loading...
    </div>

    <div ref="errorMessage" v-if="loaded === false && loadFailed === true">
      <p>Could not load data. Please reload the page and try again.</p>
    </div>

    <div ref="qtView" v-if="loaded === true">
      <h2>{{qt.title}}</h2>

      <div v-if="qtIsOpen">
        <p>This test is open.</p>

        <div class="custom-control custom-checkbox mb-3" v-if="!firstPhaseHasBeenStarted">
          <input type="checkbox" id="terms_agreed" class="custom-control-input" v-model="termsAgreed">
          <label for="terms_agreed" class="custom-control-label">
            I confirm that I will keep this test confidential and not share the scenario or questions at any point during or after the selection exercise.
          </label>
        </div>
      </div>

      <div v-if="!qtHasOpened">
        <p>This test will be open on 4 June 2019 between 7am and 9pm.</p>
      </div>

      <div v-if="!qtHasClosed">

        <div v-if="!firstPhaseHasBeenStarted">
          <h3>Test format</h3>
          <p>When you’re ready to take the test, click ‘Start’. A question and answer page will open and a timer will start. The
            timer will stop when you click ‘Submit’.</p>
        </div>

        <TestPhase v-for="(phase, index) in qt.phases" :key="phase.title" :title="phase.title" :number="index+1"
                   :termsAgreed="termsAgreed" />

        <div v-if="allQtPhasesFinished">
          <p>You can now log out.</p>
        </div>
      </div>

      <div v-if="qtHasClosed">
        <p>This test has now closed.</p>
      </div>

    </div>
  </main>
</template>

<script>
  import { mapGetters } from 'vuex';
  import TestPhase from '@/components/TestPhase';

  export default {
    components: {
      TestPhase,
    },
    data() {
      return {
        qtId: 'ANEMLDHK21g6HtnXQBiC', // hardcoded for now
        loaded: false,
        loadFailed: false,
        isStarting: false,
        termsAgreed: this.firstPhaseHasBeenStarted,
      };
    },
    methods: {
      loadQtData() {
        return Promise.all([
          this.$store.dispatch('loadQt'),
          this.$store.dispatch('loadQtSummary'),
        ])
          .then(() => {
            this.loaded = true;
            this.$store.dispatch('subscribeQtSummary');
          })
          .catch(() => {
            this.loadFailed = true;
          });
      },
    },
    computed: {
      ...mapGetters([
        'qt',
        'qtIsOpen',
        'qtHasOpened',
        'qtHasClosed',
        'allQtPhasesFinished',
      ]),
      firstPhaseHasBeenStarted() {
        const firstPhaseTitle = this.qt.phases[0].title;
        return this.$store.getters.qtPhaseHasBeenStarted(firstPhaseTitle);
      },
    },
    mounted() {
      this.$store.commit('setQtId', this.qtId);
      this.loadQtData();
    },
    destroyed() {
      this.$store.dispatch('unsubscribeQtSummary');
    },
  }
</script>

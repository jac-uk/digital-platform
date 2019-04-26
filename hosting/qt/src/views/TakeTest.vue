<template>
  <main class="container">
    <h1>Take a qualifying test</h1>
    <div v-if="loaded === false && loadFailed === false">
      <span class="spinner-border spinner-border-sm text-secondary" aria-hidden="true"></span>
      Loading...
    </div>
    <div v-if="loaded === false && loadFailed === true">
      <p>Could not load data. Please reload the page and try again.</p>
    </div>
    <div v-if="loaded === true">
      <h2>{{qt.title}}</h2>
      <div v-if="qtHasOpened === false">
        <p>
          This qualifying test is currently closed.
          It'll open at <strong>{{qt.opening_time.toLocaleTimeString()}}</strong>
          on <strong>{{qt.opening_time.toLocaleDateString()}}</strong>.
        </p>
      </div>
      <div v-if="qtHasClosed === true">
        <p>This qualifying test has now closed.</p>
      </div>
      <div v-if="qtHasOpened && !qtHasClosed">
        <div v-if="allQtPhasesFinished">
          <p>You've completed all phases of this qualifying test.</p>
        </div>
        <div v-else>
          <p>You are taking the <strong>{{qt.title}}</strong> qualifying test.</p>
          <p>It consists of {{qt.phases.length}} phases.</p>
        </div>
        <TestPhase v-for="(phase, index) in qt.phases" :key="phase.title" :title="phase.title" :number="index+1" />
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
        qtId: 'ANEMLDHK21g6HtnXQBiC',
        loaded: false,
        loadFailed: false,
        isStarting: false,
      };
    },
    methods: {
      initStore() {
        this.$store.commit('setQtId', this.qtId);
        return Promise.all([
          this.$store.dispatch('loadQt'),
          this.$store.dispatch('loadQtSummary'),
        ]);
      },
      async startPhase(phase) {
        this.isStarting = true;
        await this.$store.dispatch('startQtPhase', phase.title);
        this.isStarting = false;
        this.openPhaseForm(phase);
      },
      openPhaseForm(phase) {
        const url = this.qtPhaseFormUrl(phase.title);
        window.open(url);
      },
    },
    computed: {
      ...mapGetters([
        'qt',
        'qtHasOpened',
        'qtHasClosed',
        'qtPhaseFormUrl',
        'qtPhaseCanBeStarted',
        'qtPhaseHasBeenStarted',
        'qtPhaseHasBeenFinished',
        'allQtPhasesFinished',
      ]),
    },
    mounted() {
      this.initStore()
        .then(() => {
          this.loaded = true;
          this.$store.dispatch('subscribeQtSummary');
        })
        .catch(() => {
          this.loadFailed = true;
        });
    },
    destroyed() {
      this.$store.dispatch('unsubscribeQtSummary');
    },
  }
</script>

<style scoped>
  button[disabled] {
    cursor: progress;
  }
</style>

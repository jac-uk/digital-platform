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
        qtId: 'ANEMLDHK21g6HtnXQBiC', // hardcoded for now
        loaded: false,
        loadFailed: false,
        isStarting: false,
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
        'qtHasOpened',
        'qtHasClosed',
        'allQtPhasesFinished',
      ]),
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

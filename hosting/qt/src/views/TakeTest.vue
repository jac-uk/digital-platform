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

        <div class="card mb-3" v-for="(phase, index) in qt.phases" :key="phase.title">
          <div class="card-body">
            <h5 class="card-title">{{index+1}}. {{phase.title}}</h5>
            <div class="card-subtitle text-muted mb-3">45 minutes</div>

            <div v-if="qtPhaseHasBeenFinished(phase.title)">
              You have completed this phase
            </div>

            <div v-else-if="qtPhaseHasBeenStarted(phase.title)">
              <p>Test in progress</p>
              <button type="button" class="btn btn-primary" @click="openPhaseForm(phase)">
                Return to test
              </button>
            </div>

            <div v-else-if="qtPhaseCanBeStarted(phase.title)">
              <p>Time will begin when you click 'Start test'</p>
              <button type="button" class="btn btn-primary mr-2" @click="startPhase(phase)" :disabled="isStarting">
                Start test
              </button>
              <span class="spinner-border spinner-border-sm text-secondary" v-if="isStarting"></span>
            </div>

            <div v-else>
              <p>You must complete the above {{ (index > 1) ? 'tests' : 'test' }} before you can start this one</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
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

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
        <p>You are taking the <strong>{{qt.title}}</strong> qualifying test.</p>
        <p>It consists of {{qt.phases.length}} parts.</p>

        <div class="card mb-3" v-for="(phase, index) in qt.phases" :key="phase.title">
          <div class="card-body">
            <h5 class="card-title">{{index+1}}. {{phase.title}}</h5>
            <div class="card-text">
              <p>You will have 45 minutes to complete this phase of the test.</p>
              <p>Time will begin when you click 'Start'.</p>
            </div>
            <a href="#" class="btn btn-primary" @click.prevent="startPhase(phase)">
              Start test
            </a>
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
        const qtTitle = this.qt.title;
        const phaseTitle = phase.title;
        await this.$store.dispatch('startQtPhase', {qtTitle, phaseTitle});
      },
    },
    computed: {
      ...mapGetters([
        'qt',
        'qtHasOpened',
        'qtHasClosed',
      ]),
    },
    mounted() {
      this.initStore()
        .then(() => {
          this.loaded = true;
        })
        .catch(() => {
          this.loadFailed = true;
        });
    }
  }
</script>

<style>

</style>

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
      <h4>{{qt.title}}</h4>

      <div v-if="!qtHasOpened">
        <p>This test will be open on 23 June 2019 between 7am and 9pm.</p>
      </div>

      <div v-if="qtIsOpen">
        <p>This test is open.</p>
      </div>

      <div v-if="!qtHasClosed">
        <TestPhase v-for="(phase, index) in qt.phases" :key="phase.title" :title="phase.title" :number="index+1" />
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
        loaded: false,
        loadFailed: false,
        isStarting: false,
      };
    },
    methods: {
      loadQtData() {
        this.$store.commit('setQtId', this.$route.params.id);
        return Promise.all([
          this.$store.dispatch('loadQt'),
          this.$store.dispatch('loadQtSummary'),
        ])
          .then(() => {
            this.loaded = true;
            this.$store.dispatch('subscribeQtSummary');
          })
          .catch((e) => {
            this.loadFailed = true;
            throw e;
          });
      },
    },
    computed: {
      ...mapGetters([
        'qt',
        'qtIsOpen',
        'qtHasOpened',
        'qtHasClosed',
      ]),
    },
    mounted() {
      this.loadQtData();
    },
    destroyed() {
      this.$store.dispatch('unsubscribeQtSummary');
    },
    watch: {
      '$route' () {
        this.loaded = false;
        this.loadFailed = false;
        this.$store.dispatch('unsubscribeQtSummary');
        this.loadQtData();
      },
    },
  }
</script>

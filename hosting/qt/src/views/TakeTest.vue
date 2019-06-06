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
      <h4>{{qualifyingTest.vacancyTitle}}</h4>

      <div v-if="!qualifyingTestHasOpened">
        <p>This test will be open on 23 June 2019 between 7am and 9pm.</p>
      </div>

      <div v-if="qualifyingTestIsOpen">
        <p>This test is open.</p>
      </div>

      <TestCard v-if="!qualifyingTestHasClosed" />

      <div v-if="qualifyingTestHasClosed">
        <p>This test has now closed.</p>
      </div>
    </div>
  </main>
</template>

<script>
  import { mapGetters } from 'vuex';
  import TestCard from '@/components/TestCard';

  export default {
    components: {
      TestCard,
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
        this.$store.commit('setQtId', this.$route.params.id);
        this.$store.commit('setQualifyingTestId', this.$route.params.id);
        return Promise.all([
          this.$store.dispatch('loadQt'),
          this.$store.dispatch('loadQtSummary'),
          this.$store.dispatch('loadQualifyingTest'),
          this.$store.dispatch('loadUserQualifyingTest'),
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
        'qualifyingTest',
        'qualifyingTestIsOpen',
        'qualifyingTestHasOpened',
        'qualifyingTestHasClosed',
      ]),
    },
    mounted() {
      this.loadTestData();
    },
    destroyed() {
      this.$store.dispatch('unsubscribeQtSummary');
    },
    watch: {
      '$route' () {
        this.loaded = false;
        this.loadFailed = false;
        this.$store.dispatch('unsubscribeQtSummary');
        this.loadTestData();
      },
    },
  }
</script>

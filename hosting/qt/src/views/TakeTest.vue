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
      <h4>{{test.vacancyTitle}}</h4>

      <div v-if="!testHasOpened">
        <p>This test will be open on 23 June 2019 between 7am and 9pm.</p>
      </div>

      <div v-if="testIsOpen">
        <p>This test is open.</p>
      </div>

      <TestCard v-if="!testHasClosed" />

      <div v-if="testHasClosed">
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
        this.$store.commit('setTestId', this.$route.params.id);
        return Promise.all([
          this.$store.dispatch('loadTest'),
          this.$store.dispatch('loadUserQualifyingTest'),
        ])
          .then(() => {
            this.loaded = true;
            this.$store.dispatch('subscribeUserQualifyingTest');
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
        'testIsOpen',
        'testHasOpened',
        'testHasClosed',
      ]),
    },
    mounted() {
      this.loadTestData();
    },
    destroyed() {
      this.$store.dispatch('unsubscribeUserQualifyingTest');
    },
    watch: {
      '$route' () {
        this.loaded = false;
        this.loadFailed = false;
        this.$store.dispatch('unsubscribeUserQualifyingTest');
        this.loadTestData();
      },
    },
  }
</script>

<template>
  <main class="container">
    <h1>Take a qualifying test</h1>

    <IEWarning />

    <LoadingMessage v-if="loaded === false" loadFailed="loadFailed" />

    <div ref="qtView" v-if="loaded === true">
      <h4>{{test.vacancyTitle}}</h4>

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

      <TestCard v-if="!testHasClosed" class="mt-4" />
    </div>
  </main>
</template>

<script>
  import { mapGetters } from 'vuex';
  import TestCard from '@/components/TestCard';
  import TestWindow from '@/components/TestWindow';
  import IEWarning from '@/components/IEWarning';
  import loadTestData from '@/utils/helpers/loadTestData';
  import LoadingMessage from '@/components/LoadingMessage';

  export default {
    components: {
      TestCard,
      TestWindow,
      IEWarning,
      LoadingMessage,
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
        'userHasFinishedTest'
      ]),
    },
    mounted() {
      loadTestData(this.$store, this.$route).then((result) => {
        if(result) {
          this.loaded = true;
          return;
        }
        else {
          this.loadFailed = true;
        }
      });
    },
    destroyed() {
      this.$store.dispatch('unsubscribeUserTest');
    },
    watch: {
      '$route' () {
        this.loaded = false;
        this.loadFailed = false;
        this.$store.dispatch('unsubscribeUserTest');
        this.loadTestData();
      },
    },
  };
</script>

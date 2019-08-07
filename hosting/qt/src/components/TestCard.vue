<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">
        {{ test.title }}
      </h5>

      <p>
        There are 20 multiple choice questions of equal weight. Each question presents a hypothetical situation that you might
        face in the tribunal role you’ve applied for.
      </p>
      <p>
        In each situation there is an issue or problem you need to resolve, with 5 possible answers. You’ll need to tick a box
        for the best and worst answer in each case. There are no marks for next best or next worst answer.
      </p>

      <div v-if="testIsOpen">
        <hr>
        <div class="custom-control custom-checkbox mb-3">
          <input
            id="terms"
            v-model="termsAgreed"
            type="checkbox"
            class="custom-control-input"
            :disabled="userHasStartedTest"
          >
          <label
            for="terms"
            class="custom-control-label"
          >
            I confirm that I will keep this test confidential and not share the scenario or questions at any point during or after
            the selection exercise.
          </label>
        </div>

        <div v-if="userHasFinishedTest">
          You’ve submitted your test. You can now sign out.
        </div>

        <div v-else-if="userHasStartedTest">
          <button
            type="button"
            class="btn btn-primary"
            @click="openForm"
          >
            Return to test
          </button>
        </div>

        <div v-else>
          <button
            type="button"
            class="btn btn-primary mr-2"
            :disabled="!termsAgreed || isStarting"
            :class="{isStarting}"
            @click="start"
          >
            Start test
          </button>
          <span
            v-if="isStarting"
            class="spinner-border spinner-border-sm text-secondary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {},
  data() {
    return {
      isStarting: false,
      termsAgreedCheckbox: false,
    };
  },
  computed: {
    ...mapGetters([
      'test',
      'testIsOpen',
      'testFormUrl',
      'userHasStartedTest',
      'userHasFinishedTest',
    ]),
    termsAgreed: {
      get() {
        const started = this.userHasStartedTest;
        const checkbox = this.termsAgreedCheckbox;
        return started || checkbox;
      },
      set(value) {
        if (!this.userHasStartedTest) {
          this.termsAgreedCheckbox = value;
        }
      },
    },
  },
  methods: {
    start() {
      this.isStarting = true;
      return this.$store
        .dispatch('startTest')
        .then(this.hasStarted);
    },
    hasStarted() {
      this.isStarting = false;
      this.openForm();
    },
    openForm() {
      this.$router.push({ name: 'TakeTest' });
    },
  },
};
</script>

<style scoped>
  button.isStarting {
    cursor: progress;
  }
</style>

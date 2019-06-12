<template>
  <div class="card mb-3">
    <div class="card-body">
      <h5 class="card-title">
        {{test.title}}
        <small class="text-muted">– 50 minutes</small>
      </h5>

      <p>20 multiple choice questions</p>

      <div v-if="testIsOpen">
        <div class="custom-control custom-checkbox mb-3">
          <input type="checkbox" id="terms_agreed" class="custom-control-input" v-model="termsAgreed" :disabled="userHasStartedTest">
          <label for="terms_agreed" class="custom-control-label">
            I confirm that I will keep this test confidential and not share the scenario or questions at any point during or after the selection exercise.
          </label>
        </div>

        <div v-if="userHasFinishedTest">
          You’ve submitted your test. You can now sign out.
        </div>

        <div v-else-if="userHasStartedTest">
          <button type="button" class="btn btn-primary" @click="openForm">
            Return to test
          </button>
        </div>

        <div v-else>
          <button type="button" class="btn btn-primary mr-2"
                  @click="start"
                  :disabled="!termsAgreed || isStarting"
                  :class="{isStarting}">
            Start test
          </button>
          <span class="spinner-border spinner-border-sm text-secondary" v-if="isStarting"></span>
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
        window.location.href = this.testFormUrl;
      },
    },
  }
</script>

<style scoped>
  button.isStarting {
    cursor: progress;
  }
</style>

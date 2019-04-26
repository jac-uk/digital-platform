<template>
  <div class="card mb-3">
    <div class="card-body">
      <h5 class="card-title">{{number}}. {{title}}</h5>
      <div class="card-subtitle text-muted mb-3">45 minutes</div>

      <div v-if="hasBeenFinished">
        You have completed this phase
      </div>

      <div v-else-if="hasBeenStarted">
        <p>Test in progress</p>
        <button type="button" class="btn btn-primary" @click="openForm">
          Return to test
        </button>
      </div>

      <div v-else-if="canBeStarted">
        <p>Time will begin when you click 'Start test'</p>
        <button type="button" class="btn btn-primary mr-2" @click="start" :disabled="isStarting">
          Start test
        </button>
        <span class="spinner-border spinner-border-sm text-secondary" v-if="isStarting"></span>
      </div>

      <div v-else>
        <p>You must complete the above {{ (number > 2) ? 'tests' : 'test' }} before you can start this one</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        required: true,
      },
      number: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        isStarting: false,
      };
    },
    computed: {
      canBeStarted() {
        return this.$store.getters.qtPhaseCanBeStarted(this.title);
      },
      hasBeenStarted() {
        return this.$store.getters.qtPhaseHasBeenStarted(this.title);
      },
      hasBeenFinished() {
        return this.$store.getters.qtPhaseHasBeenFinished(this.title);
      },
      formUrl() {
        return this.$store.getters.qtPhaseFormUrl(this.title);
      },
    },
    methods: {
      async start() {
        this.isStarting = true;
        await this.$store.dispatch('startQtPhase', this.title);
        this.isStarting = false;
        this.openForm();
      },
      openForm() {
        window.open(this.formUrl);
      },
    },
  }
</script>

<style scoped>
  button[disabled] {
    cursor: progress;
  }
</style>

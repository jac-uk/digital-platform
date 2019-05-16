<template>
  <div class="card mb-3">
    <div class="card-body">
      <h5 class="card-title">
        {{title}}
        <small class="text-muted">– 40 minutes</small>
      </h5>

      <p v-if="!hasBeenFinished">
        2 questions. Give a written answer of up to 500 words per question.
      </p>

      <div v-if="hasBeenFinished">
        Submitted
      </div>

      <div v-else-if="hasBeenStarted">
        <p>You are taking this part of the test.</p>
        <button type="button" class="btn btn-primary" @click="openForm">
          Return to test
        </button>
      </div>

      <div v-else>
        <button type="button" class="btn btn-primary mr-2"
                @click="startThisPhase"
                :disabled="!canBeStarted || isStarting"
                :class="{isStarting}">
          Start
        </button>
        <span class="spinner-border spinner-border-sm text-secondary" v-if="isStarting"></span>
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
      termsAgreed: {
        type: Boolean,
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
        return this.$store.getters.qtPhaseCanBeStarted(this.title) && this.termsAgreed;
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
      startThisPhase() {
        this.isStarting = true;
        return this.$store
          .dispatch('startQtPhase', this.title)
          .then(this.thisPhaseStarted);
      },
      thisPhaseStarted() {
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
  button.isStarting {
    cursor: progress;
  }
</style>

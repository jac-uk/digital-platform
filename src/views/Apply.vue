<template>
  <main class="container">
    <h1>Apply for Vacancy</h1>
    <div v-if="loaded === false && loadFailed === false">
      Loading...
    </div>
    <div v-if="loaded === false && loadFailed === true">
      <p>Could not load data. Please reload the page and try again.</p>
    </div>
    <div v-if="loaded === true">
      <div class="row">
        <nav class="col-md-4 mb-4">
          <ApplicationNav />
        </nav>
        <div class="col-md-8">
          <RouterView />
        </div>
      </div>
    </div>
  </main>
</template>

<script>
  import ApplicationForm from "@/components/ApplicationForm";
  import ApplicationNav from "@/components/ApplicationNav";

  export default {
    name: "Apply",
    components: {
      ApplicationForm,
      ApplicationNav,
    },
    data() {
      return {
        vacancyId: 'hsQqdvAfZpSw94X2B8nA', // hardcoded for now
        loaded: false,
        loadFailed: false,
      };
    },
    methods: {
      initStore() {
        this.$store.commit('setVacancyId', this.vacancyId);
        return Promise.all([
          this.$store.dispatch('loadApplicant'),
          this.$store.dispatch('loadVacancy'),
          this.$store.dispatch('loadApplication'),
        ]);
      },
    },
    created() {
      this.initStore()
        .then((values) => {
          this.loaded = true;
        })
        .catch((error) => {
          console.error('Unable to load data:', error);
          this.loadFailed = true;
        });
    }
  }
</script>

<style scoped>

</style>

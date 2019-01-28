<template>
  <main class="container">
    <h1>Apply for Vacancy</h1>
    <div v-if="loaded === false && loadFailed == false">
      Loading...
    </div>
    <div v-if="loaded == false && loadFailed == true">
      <p>Could not load data. Please reload the page and try again.</p>
    </div>
    <div v-if="loaded === true">
      <div class="row">
        <nav class="col-md-4 mb-4">
          <ApplicationNav />
        </nav>
        <div class="col-md-8">
          <RouterView :vacancy="vacancy" :applicantDoc="docRefs.applicant" :applicationDoc="docRefs.application" />
        </div>
      </div>
    </div>
  </main>
</template>

<script>
  import ApplicationForm from "@/components/ApplicationForm";
  import ApplicationNav from "@/components/ApplicationNav";
  import {firestore} from "@/firebase";

  export default {
    name: "Apply",
    components: {
      ApplicationForm,
      ApplicationNav,
    },
    props: {
      authUser: Object,
    },
    data() {
      const vacancyId = 'hsQqdvAfZpSw94X2B8nA'; // hardcoded for now

      return {
        vacancy: {},
        formData: {
          applicant: {},
          application: {},
        },
        loaded: false,
        loadFailed: false,
        docRefs: {
          applicant: firestore.collection('applicants').doc(this.authUser.uid),
          application: null,
          vacancy: firestore.collection('vacancies').doc(vacancyId),
        },
      };
    },
    methods: {
      async loadApplication() {
        const collection = firestore.collection('applications');

        const results = await collection
          .where('applicant', '==', this.docRefs.applicant)
          .where('vacancy', '==', this.docRefs.vacancy)
          .get();

        if (results.empty) {
          this.docRefs.application = collection.doc();
          this.formData.application = {};
        } else {
          this.docRefs.application = results.docs[0].ref;
          this.formData.application = results.docs[0].data();
        }
      },
      loadVacancy() {
        return this.docRefs.vacancy.get()
          .then((doc) => {
            if (doc.exists) {
              this.vacancy = doc.data();
            } else {
              throw new Error('Vacancy does not exist');
            }
          });
      },
      loadApplicant() {
        return this.docRefs.applicant.get()
          .then((doc) => {
            if (doc.exists) {
              this.formData.applicant = doc.data();
            } else {
              this.formData.applicant = {};
            }
          });
      },
    },
    created() {
      Promise.all([
        this.loadApplicant(),
        this.loadVacancy(),
        this.loadApplication(),
        this.$store.dispatch('loadApplicant', this.authUser.uid)
      ])
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

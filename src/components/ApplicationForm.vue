<template>
  <form @submit.prevent="saveToFirestore">
    <h2>Personal Details</h2>

    <div class="form-row">
      <div class="form-group col-sm-6">
        <label for="forename">Forename</label>
        <input class="form-control" type="text" v-model="form.forename" id="forename">
      </div>
      <div class="form-group col-sm-6">
        <label for="surname">Surname</label>
        <input class="form-control" type="text" v-model="form.surname" id="surname">
      </div>
    </div>

    <h2>Relationships</h2>

    <Relationships v-model="form.relationships" />

    <button type="submit" class="btn btn-primary">Submit</button>
  </form>
</template>

<script>
import Relationships from '@/components/Relationships';
import {firestore} from '@/firebase';

export default {
  name: "ApplicationForm",
  props: {
    userId: String
  },
  components: {
    Relationships
  },
  data() {
    return {
      form: {
        forename: '',
        surname: '',
        relationships: [],
      }
    }
  },
  methods: {
    loadFromFirestore() {
      // Populate form with user's existing application, if one exists
      return this.userDoc().get()
        .then((doc) => {
          if (doc.exists) {
            this.form = doc.data();
          }
        });
    },
    saveToFirestore() {
      return this.userDoc().set(this.form)
        .then(() => {
          console.log('Document written');
        })
        .catch((error) => {
          console.error('Unable to save application form', error);
        });
    },
    userDoc() {
      return firestore.collection('applications').doc(this.userId);
    },
  },
  created() {
    this.loadFromFirestore();
  },
}
</script>

<style scoped>

</style>

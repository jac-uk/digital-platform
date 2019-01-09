<template>
  <form @submit.prevent="onSubmit">
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
import Relationships from './Relationships';
import {firestore} from '../firebase';

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
    onSubmit() {
      this.userDoc().set(this.form)
        .then(() => {
          console.log('Document written');
        })
        .catch((error) => {
          console.error('Error adding document', error);
        });
    },
    userDoc() {
      return firestore.collection('applications').doc(this.userId);
    },
  },
  mounted() {
    // Populate form with user's existing application, if one exists
    this.userDoc().get()
      .then((doc) => {
        if (doc.exists) {
          this.form = doc.data();
        }
      });
  },
}
</script>

<style scoped>

</style>

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
import firebase from '../firebase';

export default {
  name: "ApplicationForm",
  components: {
    Relationships
  },
  data() {
    return {
      form: {
        forename: '',
        surname: '',
        relationships: [
          // {forename: 'John', surname: 'Smith', relationship: 'Friend'},
          // {forename: 'Jane', surname: 'Doe', relationship: 'Mother'},
        ],
      }
    }
  },
  methods: {
    onSubmit() {
      console.log('Form was submitted');
      console.log(this.form);
      console.log(JSON.stringify(this.form));

      firebase.db.collection('applications').add(this.form)
        .then(doc => {
          console.log(`Document written with ID ${doc.id}`);
        })
        .catch(error => {
          console.error('Error adding document', error);
        });
    },
  }
}
</script>

<style scoped>

</style>

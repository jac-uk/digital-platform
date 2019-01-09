<template>
  <table class="table">
    <thead>
    <tr>
      <th>Forename</th>
      <th>Surname</th>
      <th>Relationship to you</th>
      <th></th>
    </tr>
    </thead>
    <tbody>
      <tr v-if="rows.length === 0">
        <td colspan="4" class="text-muted">
          No relationships added yet. <a href="#" @click.prevent="add">Add one now.</a>
        </td>
      </tr>
      <tr v-for="row in rows">
        <td><input class="form-control" type="text" v-model="row.forename" placeholder="Forename" /></td>
        <td><input class="form-control" type="text" v-model="row.surname" placeholder="Surname" /></td>
        <td><input class="form-control" type="text" v-model="row.relationship" placeholder="Relationship" /></td>
        <td><button class="btn btn-danger btn-sm" @click.prevent="remove(row)">×</button></td>
      </tr>
    </tbody>
    <tfoot>
    <tr>
      <td colspan="4" class="text-right">
        <button class="btn btn-success" @click.prevent="add">+ Add Relationship</button>
      </td>
    </tr>
    </tfoot>
  </table>
</template>

<script>
export default {
  name: "Relationships",
  props: ['value'],
  data() {
    return {
      rows: this.value
    }
  },
  methods: {
    add() {
      this.rows.push({
        forename: '',
        surname: '',
        relationship: '',
      });
    },

    remove(rowToRemove) {
      this.rows = this.rows.filter((row) => {
        return row !== rowToRemove;
      });
    },
  },
  watch: {
    rows(val) {
      this.$emit('input', val);
    },
    value(val) {
      this.rows = val;
    }
  }
}
</script>

<style scoped>

</style>

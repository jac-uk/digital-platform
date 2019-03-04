<template>
  <div>
    <div class="card mb-3" v-for="(row, index) in rows" :key="index">
      <component class="card-body" :row="row" :index="index" :is="component">
        <template slot="removeButton">
          <button @click.prevent="removeRow(index)" class="btn btn-secondary">
            Remove
          </button>
        </template>
      </component>
    </div>
    <div class="text-right">
      <button @click.prevent="addRow" class="btn btn-primary">
        Add another
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'RepeatableFields',
    props: {
      value: {
        validator: (value) => (value instanceof Array || value === null || value === undefined),
        required: true,
      },
      component: {
        required: true,
      },
    },
    data() {
      return {
        rows: [],
      };
    },
    methods: {
      addRow() {
        this.rows.push({});
      },
      removeRow(index) {
        this.rows.splice(index, 1);
      },
    },
    created() {
      if (this.value instanceof Array) {
        this.rows = this.value;
      } else {
        this.$emit('input', this.rows);
      }

      if (this.rows.length === 0) {
        this.addRow();
      }
    }
  }
</script>

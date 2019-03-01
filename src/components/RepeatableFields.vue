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
        type: Array,
        required: true,
      },
      component: {
        required: true,
      },
    },
    methods: {
      addRow() {
        this.rows.push({});
      },
      removeRow(index) {
        this.rows.splice(index, 1);
      },
    },
    computed: {
      rows: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit('input', value);
        }
      }
    },
    created() {
      if (this.rows.length === 0) {
        this.addRow();
      }
    }
  }
</script>

<template>
  <div>
    <div class="form-group">
      <label :for="inputIds.name">Legal Association</label>
      <input type="text" class="form-control" :id="inputIds.name" v-model="row.name">
    </div>
    <slot name="removeButton"></slot>
  </div>
</template>

<script>
  export default {
    name: 'PublishedWork',
    props: [
      'row',
      'index',
    ],
    data() {
      return {
        inputIds: {
          name: `legal_association_${this.index}_name`,
        }
      };
    },
  }
</script>

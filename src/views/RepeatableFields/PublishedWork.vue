<template>
  <div>
    <div class="form-group">
      <label :for="inputIds.title">Title</label>
      <input type="text" class="form-control" :id="inputIds.title" v-model="row.title">
    </div>
    <div class="form-group">
      <label>Date</label>
      <div class="fieldset-text">
        For example, 02 2017
      </div>
      <DateInput v-model="row.date" type="month" />
    </div>
    <slot name="removeButton"></slot>
  </div>
</template>

<script>
  import DateInput from '@/components/DateInput';

  export default {
    name: 'PublishedWork',
    components: {
      DateInput,
    },
    props: [
      'row',
      'index',
    ],
    data() {
      return {
        inputIds: {
          title: `published_work_${this.index}_title`,
        }
      };
    },
  }
</script>

<template>
  <div>
    <div :class="divClass" v-for="(option, index) in options" :key="option">
      <input class="custom-control-input" :type="type" :id="id + '_' + index" :value="option" v-model="inputValue">
      <label class="custom-control-label" :for="id + '_' + index">
        {{option}}
      </label>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'SelectList',
    props: {
      id: {
        type: String,
        required: true,
      },
      options: {
        type: Array,
        required: true,
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      value: {
        required: true,
      },
    },
    data() {
      return {};
    },
    methods: {
      makeValueAnArrayIfMultiple() {
        if (this.multiple && !(this.value instanceof Array)) {
          this.inputValue = [];
        }
      }
    },
    computed: {
      type() {
        return this.multiple ? 'checkbox' : 'radio';
      },
      divClass() {
        return [
          'custom-control',
          'custom-' + this.type,
        ];
      },
      inputValue: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit('input', value);
        }
      },
      multiAndValue() {
        return [this.multiple, this.value];
      },
    },
    watch: {
      multiAndValue() {
        this.makeValueAnArrayIfMultiple();
      },
    },
    created() {
      this.makeValueAnArrayIfMultiple();
    }
  }
</script>

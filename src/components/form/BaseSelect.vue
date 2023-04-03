<template>
  <select
    class="base__select"
    :value="modelValue"
    v-bind="{
      ...$attrs,
      onChange: ($event) => {
        $emit('update:modelValue', $event.target.value);
      },
    }"
  >
    <option value="">{{ title }}</option>
    <option
      :key="key"
      v-for="(option, key) in options"
      :value="option.value"
      :selected="option.value === modelValue"
    >
      {{ option.title }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseSelect",
  props: {
    title: {
      type: String,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      default: "",
    },
    options: {
      type: Array,
      required: true,
    },
  },
});
</script>

<style scoped>
input {
}
</style>

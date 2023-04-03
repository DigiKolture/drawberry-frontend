<template>
  <select class="base__select">
    <option value="">{{ title }}</option>
    <option :key="key" v-for="(option, key) in options" value="">
      {{ option }}
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

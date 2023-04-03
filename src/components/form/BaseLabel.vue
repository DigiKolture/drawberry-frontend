<template>
  <label>{{ title }}</label>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseLabel",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped>
input {
}
</style>

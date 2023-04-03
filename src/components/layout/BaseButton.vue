<template>
  <button class="button">{{ title }}</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseButton",
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

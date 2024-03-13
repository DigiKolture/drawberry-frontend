<template>
  <input
    class="base__input"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseInput",

  props: {
    modelValue: {
      type: [String, Number],
      default: "",
      required: false,
    },
  },
});
</script>

<style scoped></style>

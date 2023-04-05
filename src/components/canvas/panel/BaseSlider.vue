<template>
  <div class="slider__container">
    <input
      type="range"
      :min="min"
      :max="max"
      class="slider__input"
      @input="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
    />
    <div class="slider__content">
      <h5>{{ modelValue }}</h5>
      <h6>PX</h6>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseSlider",

  props: {
    modelValue: {
      type: [String, Number],
      default: "",
      required: false,
    },
    min: {
      type: Number,
      default: 1,
      required: false,
    },
    max: {
      type: Number,
      default: 90,
      required: false,
    },
  },
});
</script>

<style scoped></style>

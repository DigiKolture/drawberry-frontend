<template>
  <div class="slider__icon__container">
    <BaseIcon :icon="icon" />
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
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "BaseSliderIcon",
  components: { BaseIcon },
  props: {
    icon: {
      type: String,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      default: 20,
      required: false,
    },
    min: {
      type: Number,
      default: 0,
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

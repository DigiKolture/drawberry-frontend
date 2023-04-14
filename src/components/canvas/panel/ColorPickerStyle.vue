<template>
  <div class="color__style">
    <div class="color__style__container">
      <h5>{{ title }}</h5>
      <h5>{{ colors.hex8 }}</h5>
      <button
        @click="toggle"
        class="selected__color"
        :style="{
          background: colors.hex8,
        }"
      ></button>
    </div>
    <BaseColorPicker @cancel="show = false" v-model="colors" v-if="show" />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, defineExpose } from "vue";
import BaseColorPicker from "@/components/canvas/panel/BaseColorPicker.vue";

const props = defineProps({
  title: {
    type: String,
    default: "HEX",
  },
  color: {
    type: Object,
    default: null,
  },
});

const emits = defineEmits(["update-color", "toggle"]);

const show = ref(false);

const colors = ref({
  hex8: props.color?.hex8,
});

watch(colors, (newVal) => {
  emits("update-color", newVal);
});

const updateColor = (newVal) => {
  colors.value = newVal;
};

const toggle = () => {
  show.value = !show.value;
  emits("toggle");
};

defineExpose({ updateColor });
</script>

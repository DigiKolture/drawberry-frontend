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
    <BaseColorPicker v-model="colors" v-if="show" />
  </div>
</template>

<script>
import { defineComponent, ref, watch, defineExpose } from "vue";
import BaseColorPicker from "@/components/canvas/panel/BaseColorPicker";

export default defineComponent({
  name: "ColorPickerStyle",
  components: { BaseColorPicker },
  props: {
    title: {
      required: false,
      default: "HEX",
    },
    color: {
      required: false,
    },
  },
  setup(props, { emit }) {
    const show = ref(false);

    // const colors = { h: 150, s: 0.66, v: 0.3 };
    // const colors = ref({ h: 150, s: 0.66, v: 0.3 });

    const colors = ref({
      hex8: props.color?.hex8,
    });

    watch(colors, (newVal) => {
      emit("update-color", colors.value);
    });

    const updateColor = (newVal) => {
      colors.value = newVal;
    };

    const toggle = () => {
      show.value = !show.value;
      emit("toggle");
    };

    defineExpose({ updateColor });

    return {
      colors,
      updateColor,
      show,
      toggle,
    };
  },
});
</script>

<style scoped></style>

<template>
  <div class="color__style">
    <div class="color__style__container">
      <h5>HEX</h5>
      <h5>{{ colors.hex }}</h5>
      <button
        @click="toggle"
        class="selected__color"
        :style="{
          background: colors.hex,
        }"
      ></button>
    </div>
    <BaseColorPicker v-model="colors" v-if="show" />
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import BaseColorPicker from "@/components/canvas/panel/BaseColorPicker";

export default defineComponent({
  name: "ColorPickerStyle",
  components: { BaseColorPicker },

  setup(props, { emit }) {
    const show = ref(false);

    // const colors = { h: 150, s: 0.66, v: 0.3 };
    // const colors = ref({ h: 150, s: 0.66, v: 0.3 });

    const colors = ref({
      hsl: { h: 232.5, s: 0.11764705882352941, l: 0.13333333333333333, a: 1 },
      hex: "#1E1F26",
      hex8: "#1E1F26FF",
      rgba: { r: 30, g: 31, b: 38, a: 1 },
      hsv: { h: 232.5, s: 0.21052631578947367, v: 0.14901960784313725, a: 1 },
      oldHue: 150.00000000000003,
      source: "hex",
      a: 1,
    });

    const toggle = () => {
      show.value = !show.value;
      emit("toggle");
    };

    return {
      colors,
      show,
      toggle,
    };
  },
});
</script>

<style scoped></style>

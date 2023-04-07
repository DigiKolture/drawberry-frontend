<template>
  <div class="color__style">
    <div class="color__style__container">
      <h5>HEX</h5>
      <h5>#1E1F26</h5>
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
      hsl: { h: 150, s: 0.41713313965847093, l: 0.23653388000000003, a: 1 },
      hex: "#23553C",
      hex8: "#23553CFF",
      rgba: { r: 35, g: 85, b: 60, a: 1 },
      hsv: { h: 150, s: 0.5887, v: 0.33520000000000005, a: 1 },
      oldHue: 150,
      source: "hsva",
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

<template>
  <div class="color__style__container">
    <h5>HEX</h5>
    <h5>#1E1F26</h5>
    <button
      @click="toggle"
      class="selected__color"
      :style="{
        background: '#1E1F26',
      }"
    ></button>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
// import BaseColorPicker from "@/components/canvas/panel/BaseColorPicker";

export default defineComponent({
  name: "ColorStyle",
  // components: { BaseColorPicker },

  setup(props, { emit }) {
    const slider = ref(15);
    const show = ref(true);

    // const colors = { h: 150, s: 0.66, v: 0.3 };
    // const colors = ref({ h: 150, s: 0.66, v: 0.3 });
    const colors = ref("#194d33");

    const toggle = () => {
      show.value = !show.value;
      emit("toggle");
    };

    return {
      slider,
      colors,
      show,
      toggle,
    };
  },
});
</script>

<style scoped></style>

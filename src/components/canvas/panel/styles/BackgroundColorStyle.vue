<template>
  <PanelStyle title="BACKGROUND COLOR">
    <div class="color__style">
      <ColorStyle @toggle="togglePicker" />
      <BaseColorPicker v-model="colors" v-if="show" />
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent, ref } from "vue";
import PanelStyle from "./PanelStyle";
import ColorStyle from "@/components/canvas/panel/ColorStyle";
import BaseColorPicker from "@/components/canvas/panel/BaseColorPicker";

export default defineComponent({
  name: "BackgroundColorStyle",
  components: { BaseColorPicker, ColorStyle, PanelStyle },
  setup() {
    const slider = ref(15);
    const show = ref(true);

    // const colors = { h: 150, s: 0.66, v: 0.3 };
    // const colors = ref({ h: 150, s: 0.66, v: 0.3 });
    const colors = ref("#194d33");

    const togglePicker = () => {
      show.value = !show.value;
    };

    return {
      slider,
      colors,
      show,
      togglePicker,
    };
  },
});
</script>

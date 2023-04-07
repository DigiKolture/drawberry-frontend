<template>
  <PanelStyle title="BACKGROUND COLOR">
    <ColorPickerStyle />
  </PanelStyle>
</template>
<script>
import { defineComponent, ref } from "vue";
import PanelStyle from "./PanelStyle";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle";

export default defineComponent({
  name: "BackgroundColorStyle",
  components: { ColorPickerStyle, PanelStyle },
  setup() {
    const show = ref(true);

    return {
      show,
    };
  },
});
</script>

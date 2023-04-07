<template>
  <PanelStyle title="BACKGROUND COLOR">
    <ColorStyle />
  </PanelStyle>
</template>
<script>
import { defineComponent, ref } from "vue";
import PanelStyle from "./PanelStyle";
import ColorStyle from "@/components/canvas/panel/ColorStyle";

export default defineComponent({
  name: "BackgroundColorStyle",
  components: { ColorStyle, PanelStyle },
  setup() {
    const show = ref(true);

    return {
      show,
    };
  },
});
</script>

<template>
  <div class="canvas__panel__tabs">
    <PanelTab title="Background">
      <div class="canvas__panel__styles">
        <BorderRadiusStyle />
        <SpacingStyle />
        <ShadowStyle />
      </div>
    </PanelTab>
  </div>
</template>
<script>
import { defineComponent, ref } from "vue";
import PanelTab from "./PanelTab";
import SpacingStyle from "@/components/canvas/panel/styles/SpacingStyle";
import BorderRadiusStyle from "@/components/canvas/panel/styles/BorderRadiusStyle";
import ShadowStyle from "@/components/canvas/panel/styles/ShadowStyle";

export default defineComponent({
  name: "PanelTabs",
  components: {
    ShadowStyle,
    BorderRadiusStyle,
    SpacingStyle,
    PanelTab,
  },
  setup() {
    const slider = ref(15);

    return {
      slider,
    };
  },
});
</script>

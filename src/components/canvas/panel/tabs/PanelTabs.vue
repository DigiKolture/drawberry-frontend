<template>
  <div class="canvas__panel__tabs">
    <PanelTab title="Background">
      <div class="canvas__panel__styles">
        <BackgroundColorStyle />
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
import BackgroundColorStyle from "@/components/canvas/panel/styles/BackgroundColorStyle";

export default defineComponent({
  name: "PanelTabs",
  components: {
    BackgroundColorStyle,
    ShadowStyle,
    BorderRadiusStyle,
    SpacingStyle,
    PanelTab,
  },
  setup() {
    const slider = ref(15);

    // const colors = { h: 150, s: 0.66, v: 0.3 };
    // const colors = ref({ h: 150, s: 0.66, v: 0.3 });
    const colors = ref("194D33A8");

    return {
      slider,
      colors,
    };
  },
});
</script>

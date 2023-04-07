<template>
  <div class="canvas__panel__tabs">
    <PanelTab title="Background">
      <div class="canvas__panel__styles">
        <FontStyle />
        <div class="canvas__panel__styles__row">
          <FontSizeStyle />
          <WeightStyle />
          <LineHeightStyle />
          <LetterSpacingStyle />
        </div>
        <ContentStyle />
        <BackgroundColorStyle />
        <TextColorStyle />
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
import TextColorStyle from "@/components/canvas/panel/styles/TextColorStyle";
import ContentStyle from "@/components/canvas/panel/styles/ContentStyle";
import FontStyle from "@/components/canvas/panel/styles/FontStyle";
import FontSizeStyle from "@/components/canvas/panel/styles/FontSizeStyle";
import WeightStyle from "@/components/canvas/panel/styles/WeightStyle";
import LineHeightStyle from "@/components/canvas/panel/styles/LineHeightStyle";
import LetterSpacingStyle from "@/components/canvas/panel/styles/LetterSpacingStyle";

export default defineComponent({
  name: "PanelTabs",
  components: {
    LetterSpacingStyle,
    LineHeightStyle,
    WeightStyle,
    FontSizeStyle,
    FontStyle,
    ContentStyle,
    TextColorStyle,
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

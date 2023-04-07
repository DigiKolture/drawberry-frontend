<template>
  <div class="canvas__panel__tabs">
    <PanelTab title="Background">
      <div class="canvas__panel__styles">
        <!--        <Sketch v-model="colors" />-->
        <BaseColorPicker v-model="colors" />
        <p class="text-white">{{ colors }}</p>
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
// import { Sketch } from "@ckpack/vue-color";
import BaseColorPicker from "@/components/canvas/panel/BaseColorPicker";

export default defineComponent({
  name: "PanelTabs",
  components: {
    BaseColorPicker,
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

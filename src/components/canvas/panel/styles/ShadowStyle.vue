<template>
  <PanelStyle title="Shadow">
    <div class="shadow__style">
      <PanelStyleTabs :titles="['Outside', 'Inside']">
        <div class="shadow__style__tab__item">
          <BaseSliderIcon icon="canvas/panel/styles/shadow/y" />
          <BaseSliderIcon icon="canvas/panel/styles/shadow/x" />
          <BaseSliderIcon icon="canvas/panel/styles/shadow/blur" />
          <BaseSliderIcon icon="canvas/panel/styles/shadow/spread" />
          <ColorPickerStyle title="Color" />
        </div>
      </PanelStyleTabs>
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";
import BaseSliderIcon from "../BaseSliderIcon";
import PanelStyleTabs from "../PanelStyleTabs";
import ColorPickerStyle from "@/components/canvas/panel/ColorPickerStyle";

export default defineComponent({
  name: "ShadowStyle",
  components: { ColorPickerStyle, PanelStyleTabs, BaseSliderIcon, PanelStyle },
});
</script>

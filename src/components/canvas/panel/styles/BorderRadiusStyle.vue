<template>
  <PanelStyle title="Border radius">
    <div class="border__radius__style">
      <BaseSliderIcon icon="canvas/panel/styles/border-radius" />
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";
import BaseSliderIcon from "../BaseSliderIcon";

export default defineComponent({
  name: "BorderRadiusStyle",
  components: { BaseSliderIcon, PanelStyle },
});
</script>

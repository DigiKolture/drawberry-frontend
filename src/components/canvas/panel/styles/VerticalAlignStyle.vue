<template>
  <PanelStyle title="Vertical Align">
    <div class="align__style">
      <BaseButtonIcon class="active" icon="canvas/panel/styles/align/top" />
      <BaseButtonIcon icon="canvas/panel/styles/align/middle" />
      <BaseButtonIcon icon="canvas/panel/styles/align/bottom" />
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon";

export default defineComponent({
  name: "VerticalAlignStyle",
  components: { BaseButtonIcon, PanelStyle },
});
</script>
PanelTabs

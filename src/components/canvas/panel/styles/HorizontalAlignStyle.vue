<template>
  <PanelStyle title="Text Align">
    <div class="align__style">
      <BaseButtonIcon class="active" icon="canvas/panel/styles/align/left" />
      <BaseButtonIcon icon="canvas/panel/styles/align/center" />
      <BaseButtonIcon icon="canvas/panel/styles/align/right" />
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon";

export default defineComponent({
  name: "HorizontalAlignStyle",
  components: { BaseButtonIcon, PanelStyle },
});
</script>

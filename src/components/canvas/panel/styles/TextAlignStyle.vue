<template>
  <PanelStyle title="Content">
    <div class="text__align__style">
      <BaseButtonIcon class="active" icon="canvas/panel/styles/align/left" />
      <BaseButtonIcon icon="canvas/panel/styles/align/center" />
      <BaseButtonIcon icon="canvas/panel/styles/align/right" />
      <BaseButtonIcon icon="hamburger" />
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon";

export default defineComponent({
  name: "TextAlignStyle",
  components: { BaseButtonIcon, PanelStyle },
});
</script>

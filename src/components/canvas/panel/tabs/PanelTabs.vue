<template>
  <div class="canvas__panel__tabs">
    <PanelTab title="Background">
      <div class="canvas__panel__styles">
        <PanelStyle title="BACKGROUND COLOR"> </PanelStyle>
      </div>
    </PanelTab>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import PanelTab from "./PanelTab";
import PanelStyle from "../styles/PanelStyle";

export default defineComponent({
  name: "PanelTabs",
  components: { PanelStyle, PanelTab },
});
</script>

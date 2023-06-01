<template>
  <PanelStyle name="font" title="Font">
    <div class="font__style">
      <select class="canvas__select" name="" id="">
        <option value="">DB Sans</option>
        <option value="">AirBnB</option>
        <option value="">Open Sans</option>
      </select>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";

export default defineComponent({
  name: "SidebarFontStyle",
  components: { PanelStyle },
});
</script>

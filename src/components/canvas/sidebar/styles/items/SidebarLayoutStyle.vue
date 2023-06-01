<template>
  <PanelStyle title="Layout">
    <div class="layout__style">
      <div class="layout__style__item layout__style__collapsed">
        <div></div>
      </div>
      <div class="layout__style__item layout__style__cards">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";

export default defineComponent({
  name: "SidebarLayoutStyle",
  components: { PanelStyle },
});
</script>

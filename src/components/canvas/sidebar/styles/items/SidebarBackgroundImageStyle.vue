<template>
  <PanelStyle title="Background Image">
    <div class="background__image__style">
      <PanelStyleTabs :titles="titles" />
      <div class="background__image__tabs__items">
        <div class="background__image__upload">
          <h6>Replace Image</h6>
          <button><BaseIcon icon="canvas/sidebar/styles/bg" /></button>
        </div>
      </div>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import PanelStyleTabs from "@/components/canvas/panel/PanelStyleTabs.vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "SidebarBackgroundImageStyle",
  components: { BaseIcon, PanelStyleTabs, PanelStyle },

  setup() {
    const titles = ["Upload", "URL"];

    return {
      titles,
    };
  },
});
</script>

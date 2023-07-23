<template>
  <div class="sidebar__styles__container">
    <SidebarLayoutStyle />
    <SidebarBackgroundColorStyle />
    <SidebarFontStyle />
    <SidebarBackgroundImageStyle />
    <SidebarPreviewTextStyle />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import SidebarLayoutStyle from "@/components/canvas/sidebar/styles/items/SidebarLayoutStyle.vue";
import SidebarBackgroundColorStyle from "@/components/canvas/sidebar/styles/items/SidebarBackgroundColorStyle.vue";
import SidebarFontStyle from "@/components/canvas/sidebar/styles/items/SidebarFontStyle.vue";
import SidebarBackgroundImageStyle from "@/components/canvas/sidebar/styles/items/SidebarBackgroundImageStyle.vue";
import SidebarPreviewTextStyle from "@/components/canvas/sidebar/styles/items/SidebarPreviewTextStyle.vue";

export default defineComponent({
  name: "StylesContainer",
  components: {
    SidebarPreviewTextStyle,
    SidebarBackgroundImageStyle,
    SidebarFontStyle,
    SidebarBackgroundColorStyle,
    SidebarLayoutStyle,
  },
  setup() {
    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    return {
      workspaceComponents,
    };
  },
});
</script>

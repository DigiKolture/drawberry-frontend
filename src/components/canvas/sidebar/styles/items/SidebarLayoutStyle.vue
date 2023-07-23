<template>
  <PanelStyle title="Layout">
    <div class="layout__style">
      <div
        @click="changeLayout('collapsed')"
        :class="{ active: isActive('collapsed') }"
        class="layout__style__item layout__style__collapsed"
      >
        <div></div>
      </div>
      <div
        @click="changeLayout('cards')"
        :class="{ active: isActive('cards') }"
        class="layout__style__item layout__style__cards"
      >
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import store from "@/store";

export default defineComponent({
  name: "SidebarLayoutStyle",
  components: { PanelStyle },

  setup() {
    const boxShadow: any = {
      cards: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
      collapsed: "0 0 0 0 rgba(0, 0, 0, 0.1)",
    };
    const borderRadius: any = {
      cards: "8px",
      collapsed: "0px",
    };
    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const isActive = (lay: string) => {
      return style.value.layout === lay;
    };

    const changeLayout = async (lay: string) => {
      if (lay === style.value.layout) return;
      style.value.layout = lay;
      store.dispatch("canvas/updateProjectStyle", style.value).then();
      const componentsStyle = {
        "border-radius": borderRadius[lay],
        "box-shadow": boxShadow[lay],
      };
      await store.dispatch("canvas/updateFirstProjectComponentsStyles", {
        projectId: project.value.id,
        style: componentsStyle,
      });
    };

    return {
      isActive,
      changeLayout,
      style,
    };
  },
});
</script>

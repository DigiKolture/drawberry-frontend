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
    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const isActive = (lay: string) => {
      return style.value.layout === lay;
    };

    const changeLayout = async (lay: string) => {
      if (lay === style.value.layout) return;
      style.value.layout = lay;
      store.dispatch("canvas/updateProjectStyle", style.value).then();
      store.commit("canvas/UPDATE_FIRST_PROJECT_COMPONENTS_STYLE", lay);
    };

    return {
      isActive,
      changeLayout,
      style,
    };
  },
});
</script>

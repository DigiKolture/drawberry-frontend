<template>
  <PanelStyle :modifier="`general-${name}`" title="Layout">
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
import { defineComponent, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import store from "@/store";
import { generalStyleUpdater } from "@/composables/canvas/modifiers/general-style-updater";

export default defineComponent({
  name: "SidebarLayoutStyle",
  components: { PanelStyle },

  setup() {
    const name = "layout";
    const { modifier } = generalStyleUpdater(name);

    const isActive = (lay: string) => {
      return modifier.value === lay;
    };

    const changeLayout = async (lay: string) => {
      if (lay === modifier.value) return;
      modifier.value = lay;
    };

    watch(modifier, (newVal) => {
      store.commit("canvas/UPDATE_FIRST_PROJECT_COMPONENTS_STYLE", newVal);
    });

    return {
      name,
      isActive,
      changeLayout,
    };
  },
});
</script>

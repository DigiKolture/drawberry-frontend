<template>
  <section>
    <CanvasPanelGroupedStyles v-if="focusedElement" />
    <CanvasPanelEmpty v-else-if="hasWorkspaceComponent" />
  </section>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import CanvasPanelEmpty from "@/components/canvas/panel/CanvasPanelEmpty.vue";
import CanvasPanelGroupedStyles from "@/components/canvas/panel/CanvasPanelGroupedStyles.vue";
import { canvas } from "@/composables/canvas/canvas";

export default defineComponent({
  name: "CanvasPanel",
  components: { CanvasPanelGroupedStyles, CanvasPanelEmpty },
  setup() {
    const { hasWorkspaceComponent } = canvas();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    return {
      focusedElement,
      hasWorkspaceComponent,
    };
  },
});
</script>

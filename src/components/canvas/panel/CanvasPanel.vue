<template>
  <section>
    <CanvasPanelMobileNotice v-if="focusedElement && isMobileBreakpoint" />
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
import CanvasPanelMobileNotice from "@/components/canvas/panel/CanvasPanelMobileNotice.vue";
import { CanvasBreakpoints } from "@/store/modules/canvas/types";

export default defineComponent({
  name: "CanvasPanel",
  components: {
    CanvasPanelMobileNotice,
    CanvasPanelGroupedStyles,
    CanvasPanelEmpty,
  },
  setup() {
    const { hasWorkspaceComponent } = canvas();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const breakpoint = computed(() => store.getters["canvas/breakpoint"]);

    const isMobileBreakpoint = computed(
      () => breakpoint.value === CanvasBreakpoints.MOBILE
    );

    return {
      focusedElement,
      hasWorkspaceComponent,
      isMobileBreakpoint,
    };
  },
});
</script>

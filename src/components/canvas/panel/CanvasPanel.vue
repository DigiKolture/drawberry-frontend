<template>
  <section>
    <CanvasPanelGroupedStyles v-if="focusedElement" />
    <CanvasPanelEmpty v-else />
  </section>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import CanvasPanelEmpty from "@/components/canvas/panel/CanvasPanelEmpty.vue";
import CanvasPanelGroupedStyles from "@/components/canvas/panel/CanvasPanelGroupedStyles.vue";

export default defineComponent({
  name: "CanvasPanel",
  components: { CanvasPanelGroupedStyles, CanvasPanelEmpty },
  setup() {
    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    return {
      focusedElement,
    };
  },
});
</script>

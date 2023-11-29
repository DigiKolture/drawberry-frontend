<template>
  <div class="workspace__component__drop__indicator" :class="style.layout">
    <span><BaseIcon icon="canvas/workspace/drop-indicator" /></span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "WorkspaceComponentDropIndicator",
  components: { BaseIcon },

  setup() {
    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    return { style };
  },
});
</script>

<style scoped></style>

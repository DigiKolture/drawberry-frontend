<template>
  <div class="workspace__component__drop__skeleton" :class="style.layout">
    <BaseIcon icon="canvas/workspace/loading" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "WorkspaceComponentDropSkeleton",
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

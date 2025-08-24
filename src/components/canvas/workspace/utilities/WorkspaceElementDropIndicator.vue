<template>
  <div class="workspace__component__drop__indicator">
    <span><BaseIcon icon="canvas/workspace/drop-indicator" /></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "WorkspaceElementDropIndicator",
  components: { BaseIcon },
});
</script>

<style scoped></style>

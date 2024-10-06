<template>
  <div class="header__redo">
    <button @click="undo" :disabled="!canUndo">
      <BaseIcon icon="header/redo/backward" />
    </button>
    <button @click="redo" :disabled="!canRedo">
      <BaseIcon icon="header/redo/forward" />
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import BaseIcon from "@/components/icon/BaseIcon.vue";
import { history } from "@/composables/canvas/history";
export default defineComponent({
  name: "HeaderProjectHistory",

  components: {
    BaseIcon,
  },

  setup() {
    const { undo, redo, canUndo, canRedo } = history();

    return {
      canUndo,
      canRedo,
      redo,
      undo,
    };
  },
});
</script>

<style></style>

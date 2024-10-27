<template>
  <div v-if="canvasLoading" class="header__home__skeleton"></div>
  <router-link v-else to="/projects" class="header__home">
    <button><BaseIcon icon="arrow/left" /></button>
    <button><BaseIcon icon="header/home" /></button>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { canvas } from "@/composables/canvas/canvas";
export default defineComponent({
  name: "HeaderContainerLeft",
  components: { BaseIcon },

  setup() {
    const { canvasLoading } = canvas();

    return { canvasLoading };
  },
});
</script>

<style></style>

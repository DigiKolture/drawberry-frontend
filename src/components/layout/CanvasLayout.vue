<template>
  <BaseLayout>
    <section class="canvas__layout">
      <div class="canvas__container">
        <aside class="canvas__sidebar">
          <div class="canvas__sidebar__container">
            <slot name="sidebar" />
          </div>
        </aside>
        <section class="canvas__workspace" id="canvas-workspace">
          <div class="canvas__workspace__container">
            <slot name="workspace" />
          </div>
        </section>
      </div>
    </section>
  </BaseLayout>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import { ui } from "@/assets/js/canvas";

export default defineComponent({
  name: "CanvasLayout",
  components: { BaseLayout },

  setup() {
    onMounted(() => {
      ui.mainIndex();
    });
  },
});
</script>

<style></style>

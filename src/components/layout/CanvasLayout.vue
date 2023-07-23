<template>
  <BaseLayout>
    <section class="canvas__layout">
      <div class="canvas__container" :class="{ nav__content__docked: docked }">
        <aside class="canvas__sidebar">
          <div class="canvas__sidebar__container">
            <slot name="sidebar" />
          </div>
        </aside>
        <section
          class="canvas__workspace"
          :style="styles"
          id="canvas-workspace"
        >
          <div class="canvas__workspace__container">
            <slot name="workspace" />
          </div>
        </section>

        <section class="canvas__panel" id="canvas-panel">
          <div class="canvas__panel__container">
            <slot name="panel" />
          </div>
        </section>
      </div>
    </section>
  </BaseLayout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import { ui } from "@/assets/js/canvas";
import store from "@/store";

export default defineComponent({
  name: "CanvasLayout",
  components: { BaseLayout },

  setup() {
    onMounted(() => {
      ui.mainIndex();
    });

    const styles = computed(() => {
      return {
        backgroundColor: style.value.backgroundColor,
        backgroundImage: `url('${style.value.backgroundImage}')`,
      };
    });

    const sidebarNavContent = computed(() => {
      return store.getters["canvas/sidebarNavContent"];
    });

    const sidebarDock = computed(() => {
      return store.getters["canvas/sidebarDock"];
    });

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const docked = computed(() => {
      return sidebarDock.value && sidebarNavContent.value !== null;
    });

    return {
      sidebarDock,
      docked,
      styles,
    };
  },
});
</script>

<style></style>

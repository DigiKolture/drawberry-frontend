<template>
  <BaseLayout>
    <section class="canvas__layout">
      <div
        class="canvas__container"
        :class="[
          {
            nav__content__docked: docked,
            has__right__panel: hasWorkspaceComponent,
          },
        ]"
      >
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
          <slot name="workspace" />
        </section>
        <section
          v-if="hasWorkspaceComponent"
          class="canvas__panel"
          id="canvas-panel"
        >
          <div class="canvas__panel__container">
            <slot name="panel" />
          </div>
        </section>
      </div>
      <slot name="modals" />
    </section>
  </BaseLayout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import { ui } from "@/assets/js/canvas";
import store from "@/store";
import { canvas } from "@/composables/canvas/canvas";

export default defineComponent({
  name: "CanvasLayout",
  components: { BaseLayout },

  setup() {
    onMounted(() => {
      ui.mainIndex();
    });

    const { hasWorkspaceComponent } = canvas();

    const styles = computed(() => {
      return {
        backgroundColor: style.value.backgroundColor,
        backgroundImage: `url('${style.value.backgroundImage}')`,
        backgroundSize: "cover",
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
      hasWorkspaceComponent,
    };
  },
});
</script>

<style></style>

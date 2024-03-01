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
          @click="handleClickEmpty"
        >
          <slot name="workspace" />
        </section>
        <section
          v-if="hasWorkspaceComponent"
          class="canvas__panel"
          :class="{ has__modal: colorPicker }"
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
import { focus } from "@/composables/canvas/focus";

export default defineComponent({
  name: "CanvasLayout",
  components: { BaseLayout },

  setup() {
    onMounted(() => {
      ui.mainIndex();
    });

    const id = "canvas-workspace";

    const { hasWorkspaceComponent } = canvas();
    const { removeFocus, removeCurrentFocus } = focus();

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

    const colorPicker = computed(() => {
      return store.getters["modals/colorPicker"];
    });

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const docked = computed(() => {
      return sidebarDock.value && sidebarNavContent.value !== null;
    });

    const handleClickEmpty = (e: any) => {
      // Check if the clicked element is within your component or if the clicked element doesnt have an ID
      const workspaceId = [
        "canvas-workspace",
        "canvas-workspace-container",
        "canvas-workspace-items-container",
      ];

      const workspaceClasses = ["workspace__component__items__list__item"];
      if (
        workspaceId.includes(e.target.id) ||
        workspaceClasses.some((clas) => e.target.classList.contains(clas))
      ) {
        removeCurrentFocus();
        removeFocus();
      }
    };

    return {
      sidebarDock,
      docked,
      colorPicker,
      styles,
      hasWorkspaceComponent,
      handleClickEmpty,
    };
  },
});
</script>

<style></style>

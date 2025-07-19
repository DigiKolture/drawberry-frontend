<template>
  <div
    class="workspace__component__items__list"
    @drop="dropComponent($event, itemIndex, projectId)"
    @dragover.prevent
    @dragenter.prevent
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <WorkspaceComponentDropIndicator v-if="drop" />
    <WorkspaceComponentDropSkeleton v-if="dropLoading || dropLoadingState" />

    <div class="workspace__component__items__list__item decoy"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import WorkspaceComponentDropSkeleton from "@/components/canvas/workspace/utilities/WorkspaceComponentDropSkeleton.vue";
import WorkspaceComponentDropIndicator from "@/components/canvas/workspace/utilities/WorkspaceComponentDropIndicator.vue";
import store from "@/store";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { indicators } from "@/composables/canvas/indicators";
import { ui } from "@/assets/js/canvas";

export default defineComponent({
  name: "WorkspaceLastComponentDecoy",
  components: {
    WorkspaceComponentDropIndicator,
    WorkspaceComponentDropSkeleton,
  },
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { upsertComponentItem, checkIfParentIsBeenDragged } = drag_and_drop();
    const { validateWorkspaceIndicator } = indicators();

    const drop = ref(false);
    const dropLoading = ref(false);

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const dropLoadingState = computed(() => {
      return store.getters["canvas/dropLoading"];
    });

    const itemIndex = computed(() => {
      return workspaceComponents.value.length;
    });

    const handleDragOver = (e: any) => {
      //TODO: Set this values to null or empty when dragging element
      const fromIndex = e.dataTransfer.getData("fromComponentItemIndex");
      const type = e.dataTransfer.getData("type");
      const toIndex = itemIndex.value;

      ui.changeComponentItemsStatus(false);

      const show = validateWorkspaceIndicator(type, fromIndex, toIndex);
      if (!show) return;

      drop.value = true;
    };

    const handleDragLeave = () => {
      drop.value = false;
    };

    const dropComponent = async (
      event: Event,
      itemIndex: number,
      projectId: string
    ) => {
      dropLoading.value = true;
      drop.value = false;
      await upsertComponentItem(event, itemIndex, projectId);
      dropLoading.value = false;
    };

    return {
      workspaceComponents,
      drop,
      dropLoadingState,
      dropLoading,
      itemIndex,
      handleDragOver,
      handleDragLeave,
      dropComponent,
    };
  },
});
</script>

<style scoped></style>

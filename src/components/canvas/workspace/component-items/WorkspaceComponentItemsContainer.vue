<template>
  <div
    class="workspace__component__items__container"
    @drop.self="changeComponentItemPosition($event, 0, projectId)"
    @dragover.prevent
    @dragenter.prevent
  >
    <CanvasWorkspaceEmpty v-if="workspaceComponents.length === 0" />

    <WorkspaceComponentItemsListItem
      v-for="(componentItem, itemIndex) in workspaceComponents"
      :key="componentItem.id"
      :component-item="componentItem"
      :item-index="itemIndex"
      :project-id="projectId"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import WorkspaceComponentItemsListItem from "./WorkspaceComponentItemsListItem.vue";
import CanvasWorkspaceEmpty from "../CanvasWorkspaceEmpty.vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import store from "@/store";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "WorkspaceComponentItemsContainer",
  components: {
    CanvasWorkspaceEmpty,
    WorkspaceComponentItemsListItem,
  },

  setup() {
    const { changeComponentItemPosition } = drag_and_drop();

    const route = useRoute();
    const projectId = route.params.id as string;

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    onMounted(async () => {
      await store.dispatch("canvas/getProjectComponentItems", projectId);
    });

    return {
      workspaceComponents,
      changeComponentItemPosition,
      projectId,
    };
  },
});
</script>

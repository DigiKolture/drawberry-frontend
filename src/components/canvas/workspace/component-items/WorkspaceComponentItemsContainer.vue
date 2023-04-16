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
      :is-mounted="isMounted"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
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
    const isMounted = ref(false);

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    onMounted(async () => {
      //TODO: Look into the glitches that occuress before the page the styles is completely loaded
      await Promise.all([
        store.dispatch("canvas/getProjectComponentItems", projectId),
        store.commit("projects/SET_PROJECT_ID", projectId),
      ]);
      isMounted.value = true;
    });

    return {
      workspaceComponents,
      changeComponentItemPosition,
      projectId,
      isMounted,
    };
  },
});
</script>

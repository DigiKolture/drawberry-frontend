<template>
  <div
    class="canvas__workspace__empty__container"
    @drop="dropComponent($event, 0, projectId)"
    @dragover.prevent
    @dragenter.prevent
  >
    <div v-if="!dropLoading" class="canvas__workspace__empty">
      <p>
        Hit the <span>+</span> button to <span>drag and drop</span> components
        from the component panel
      </p>
      <button @click="openSidebar">
        <BaseIcon icon="add" />
      </button>
    </div>
    <WorkspaceComponentDropSkeleton v-else />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseIcon from "../../icon/BaseIcon.vue";
import store from "@/store";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import WorkspaceComponentDropSkeleton from "@/components/canvas/workspace/utilities/WorkspaceComponentDropSkeleton.vue";

export default defineComponent({
  name: "CanvasWorkspaceEmpty",
  components: { WorkspaceComponentDropSkeleton, BaseIcon },
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },

  setup() {
    const { upsertComponentItem } = drag_and_drop();

    const dropLoading = ref(false);

    const openSidebar = () => {
      store.commit("canvas/SET_SIDEBAR_NAVBAR_CONTENT", "add_component");
    };

    const dropComponent = async (
      event: Event,
      itemIndex: number,
      projectId: string
    ) => {
      dropLoading.value = true;
      await upsertComponentItem(event, itemIndex, projectId);
      dropLoading.value = false;
    };

    return {
      dropLoading,
      openSidebar,
      dropComponent,
    };
  },
});
</script>

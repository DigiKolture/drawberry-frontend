<template>
  <div
    class="workspace__component__items__container"
    @drop.self="changeComponentItemPosition($event, 0)"
    @dragover.prevent
    @dragenter.prevent
  >
    <CanvasWorkspaceEmpty v-if="myComponentItems.length === 0" />

    <WorkspaceComponentItemsListItem
      v-for="(componentItem, itemIndex) in myComponentItems"
      :key="componentItem.id"
      :component-item="componentItem"
      :item-index="itemIndex"
    />
  </div>
</template>
<script>
import { computed, defineComponent } from "vue";
import WorkspaceComponentItemsListItem from "./WorkspaceComponentItemsListItem";
import CanvasWorkspaceEmpty from "../CanvasWorkspaceEmpty";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import store from "@/store";

export default defineComponent({
  name: "WorkspaceComponentItemsContainer",
  components: {
    CanvasWorkspaceEmpty,
    WorkspaceComponentItemsListItem,
  },

  setup() {
    const { changeComponentItemPosition } = drag_and_drop();

    const myComponentItems = computed(() => {
      return store.getters["components/myComponentItems"];
    });

    return {
      myComponentItems,
      changeComponentItemPosition,
    };
  },
});
</script>

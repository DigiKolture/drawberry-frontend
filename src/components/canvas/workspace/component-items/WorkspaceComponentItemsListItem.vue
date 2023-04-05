<template>
  <div
    class="workspace__component__items__list__item"
    v-html="componentItem.html"
    :draggable="true"
    @dragstart.self="moveComponentItemPosition($event, itemIndex)"
    @drop="changeComponentItemPosition($event, itemIndex)"
    @dragover.prevent
    @dragenter.prevent
  ></div>
</template>
<script>
import { defineComponent } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";

export default defineComponent({
  name: "WorkspaceComponentItemsListItem",

  props: {
    componentItem: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: [Number, String],
      required: true,
    },
  },

  setup() {
    const { moveComponentItemPosition, changeComponentItemPosition } =
      drag_and_drop();

    return {
      moveComponentItemPosition,
      changeComponentItemPosition,
    };
  },
});
</script>

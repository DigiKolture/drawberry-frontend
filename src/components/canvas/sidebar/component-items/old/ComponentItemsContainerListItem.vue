<template>
  <div>
    <div
      :draggable="true"
      class="component__items__list__item"
      @dragstart.self="dragComponentItemToCanvas($event, itemIndex)"
      v-html="componentItem.html"
    ></div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";

export default defineComponent({
  name: "ComponentItemsContainerListItem",

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
    const { dragComponentItemToCanvas } = drag_and_drop();

    return {
      dragComponentItemToCanvas,
    };
  },
});
</script>

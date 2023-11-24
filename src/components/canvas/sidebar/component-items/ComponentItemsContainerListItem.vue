<template>
  <div>
    <div
      :draggable="true"
      class="component__items__list__item"
      v-html="componentItem.html"
      @dragstart="dragComponentItemToCanvas($event, itemIndex)"
      @click="clickEvent($event)"
    ></div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
const { dragComponentItemToCanvas } = drag_and_drop();

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
    const clickEvent = (event) => {
      event.preventDefault();
    };

    return {
      dragComponentItemToCanvas,
      clickEvent,
    };
  },
});
</script>

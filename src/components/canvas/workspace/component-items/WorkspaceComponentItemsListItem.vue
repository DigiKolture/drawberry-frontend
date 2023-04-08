<template>
  <div
    class="workspace__component__items__list__item"
    v-html="componentItem.html"
    :draggable="true"
    @dragstart.self="moveComponentItemPosition($event, itemIndex)"
    @drop="changeComponentItemPosition($event, itemIndex)"
    @dragover.prevent
    @dragenter.prevent
    @click="handleClick"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
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

    const handleClick = (event) => {
      event.preventDefault();
      const target = event.target;
      if (target.classList.contains("editable")) {
        removeAllFocus();
        target.classList.add("focus");
        console.log({ ID: event.target.id });
      }
    };

    const handleMouseOver = (event) => {
      const target = event.target;
      if (target.classList.contains("editable")) {
        removeAllHover();
        target.classList.add("hover");
        console.log({ ID: event.target.id });
      }
    };

    const handleMouseLeave = (event) => {
      const target = event.target;
      target.classList.remove("hover");
      console.log({ ID: event.target.id });
    };

    const removeAllHover = () => {
      const hovers = document.querySelectorAll(".hover");
      for (let i = 0; i < hovers.length; i++) {
        hovers[i].classList.remove("hover");
      }
    };

    const removeAllFocus = () => {
      const elements = document.querySelectorAll(".focus");
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("focus");
      }
    };

    return {
      moveComponentItemPosition,
      changeComponentItemPosition,
      handleClick,
      handleMouseOver,
      handleMouseLeave,
    };
  },
});
</script>

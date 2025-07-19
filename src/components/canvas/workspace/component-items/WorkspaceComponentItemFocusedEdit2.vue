<template>
  <div class="element-controls" :style="getFocusedElementPosition"></div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import store from "@/store";
import cheerio from "cheerio";
export default defineComponent({
  name: "WorkspaceComponentItemFocusedEdit",
  props: {
    itemIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const selectedElementId = ref<string | null>(null);
    const elementPosition = ref({ top: 0, left: 0, width: 0, height: 0 });

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const getFocusedElementPosition = computed(() => {
      if (focusedIndex.value === null) return { display: "none" };

      // const componentContainer = document.getElementById(
      //   `workspace-component-item-${focusedIndex.value}`
      // );

      const componentContainer = document.getElementById(
        `workspace__component__items__list`
      );
      // const baseSelector = `[id^="workspace-component-item-${focusedIndex.value}"]`;

      if (focusedElement.value === null) return { display: "none" };

      const elementId = focusedElement.value.id;
      // const element = document.querySelector(
      //   `${baseSelector} [id="${elementId}"]`
      // );

      if (!componentContainer) return { display: "none" };

      // const element = componentContainer.querySelector(`[id="${elementId}"]`);
      const element = componentContainer.querySelector(".focus");
      if (!element || !componentContainer) return { display: "none" };

      console.log({ element });

      const containerRect = componentContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const data = {
        top: `${elementRect.top - containerRect.top}px`,
        left: `${elementRect.left - containerRect.left}px`,
        width: `${elementRect.width}px`,
        height: `${elementRect.height}px`,
        display: "block",
      };
      console.log({
        data,
        elementId,
        focusedIndex: focusedIndex.value,
        pos: { containerRect, elementRect },
      });
      return data;
    });

    return {
      selectedElementId,
      getFocusedElementPosition,
    };
  },
});
</script>

<style scoped>
.element-controls {
  position: absolute;
  outline: 2px solid red;
  /*border: 2px solid red;*/
  z-index: 10;
  box-sizing: border-box;
  pointer-events: none;
  transition: all 0.2s ease;
}
</style>

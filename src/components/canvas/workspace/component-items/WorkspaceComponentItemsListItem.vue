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
<script lang="ts">
import { computed, defineComponent, onMounted, watch } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import store from "@/store";
import * as cheerio from "cheerio";
import { updateDom } from "@/composables/canvas/update_dom";

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

  setup(props) {
    const { moveComponentItemPosition, changeComponentItemPosition } =
      drag_and_drop();

    const { updateElementDom } = updateDom();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    onMounted(() => {
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);

      loadStylesForComponent(props);

      // store.commit("canvas/SET_FOCUSED_ELEMENT", null);
      // if (focusedElement.value) {
      //   document
      //     .getElementById(focusedElement.value.id)
      //     ?.classList.add("focus");
      //   // const element = document.getElementById(focusedElement.value.id);
      //   // console.log({ element });
      //
      //   // element?.classList.add("focus");
      // }
    });

    const getComponentItemElementObject = (id: string) => {
      return props.componentItem.json.find((element: any) => element.id === id);
    };

    watch(focusedElement, () => {
      // console.log("<<<<< UPDATED FOCUSED ELEMENT");
      // loadStylesForComponent(props);
    });

    const loadStylesForComponent = (props: any) => {
      let html = props.componentItem.html;
      const json = props.componentItem.json;

      for (let elementJson of json) {
        if (!elementJson.attributes.style.value) continue;
        html = updateElementDom(html, elementJson);
      }
      //eslint-disable-next-line vue/no-mutating-props
      props.componentItem.html = html;
    };

    const handleClick = (event: any) => {
      event.preventDefault();
      const target = event.target;
      if (target.classList.contains("editable")) {
        removeAllFocus();
        target.classList.add("focus");
        const elementJson = getComponentItemElementObject(event.target.id);
        if (elementJson) {
          store.commit(
            "canvas/SET_FOCUSED_ELEMENT",
            JSON.parse(JSON.stringify(elementJson))
          );
          store.commit("canvas/SET_FOCUSED_INDEX", props.itemIndex);
        }
        // console.log({ ID: event.target.id, styles });
      }
    };

    const handleMouseOver = (event: any) => {
      const target = event.target;
      if (target.classList.contains("editable")) {
        removeAllHover();
        target.classList.add("hover");
      }
    };

    const handleMouseLeave = (event: any) => {
      const target = event.target;
      target.classList.remove("hover");
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

<template>
  <div
    class="workspace__component__items__list__item"
    v-html="componentItem.html"
    :draggable="true"
    @dragstart.self="moveComponentItemPosition($event, itemIndex)"
    @drop="changeComponentItemPosition($event, itemIndex, projectId)"
    @dragover.prevent
    @dragenter.prevent
    @click="handleClick"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  ></div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, nextTick, watch } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import store from "@/store";
import { updateDom } from "@/composables/canvas/update_dom";

export default defineComponent({
  name: "WorkspaceComponentItemsListItem",

  props: {
    projectId: {
      type: String,
      required: true,
    },
    componentItem: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: [Number, String],
      required: true,
    },
    isMounted: {
      type: Boolean,
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

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    onMounted(() => {
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);
    });

    watch(
      () => props.isMounted,
      (value) => {
        if (value) {
          loadStylesForComponent(props);
        }
      }
    );

    const getComponentItemElementObject = (id: string) => {
      return props.componentItem.json.find((element: any) => element.id === id);
    };

    // watch(
    //   workspaceComponents,
    //   (newVal) => {
    //     const el = document.getElementById(focusedElement.value.id);
    //     el.classList.add("focus");
    //   },
    //   { deep: true }
    // );

    const loadStylesForComponent = (props: any) => {
      let html = props.componentItem.html;
      const json = props.componentItem.json;

      for (let elementJson of json) {
        if (!elementJson.attributes.style.value) continue;

        html = updateElementDom(html, elementJson);

        //   if (elementJson.id === "header9_headerLink3") {
        //     console.log({
        //       elementJson: JSON.parse(JSON.stringify(elementJson)),
        //       attributes: JSON.parse(JSON.stringify(elementJson.attributes)),
        //     });
        //     console.log(html);
        //   }
      }
      //eslint-disable-next-line vue/no-mutating-props
      props.componentItem.html = html;
    };

    const handleClick = (event: any) => {
      event.preventDefault();
      const target = event.target;
      if (target.classList.contains("editable")) {
        const elementJson = getComponentItemElementObject(event.target.id);
        if (elementJson) {
          removeAllFocus();
          target.classList.add("focus");

          store.commit(
            "canvas/SET_FOCUSED_ELEMENT",
            JSON.parse(JSON.stringify(elementJson))
          );
          store.commit("canvas/SET_FOCUSED_INDEX", props.itemIndex);
        }
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

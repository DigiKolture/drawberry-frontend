<template>
  {{ classes }}
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
    v-if="isMounted"
  ></div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import store from "@/store";
import { updateDom } from "@/composables/canvas/update_dom";
import { layers } from "@/composables/canvas/layers";

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
    const {
      addHoverClassToElement,
      getComponentElementIndexUsingId,
      removeHoverClassFromElement,
    } = layers();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const currentHoverElementId = ref("");

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    onMounted(() => {
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);
    });

    const classes = computed(() => {
      return props.componentItem.json.map((el: any) => el.classes);
    });

    watch(
      () => props.isMounted,
      (value) => {
        if (value) {
          console.log("Loading this >>>>>>>");
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

    const handleMouseOver = async (event: any) => {
      const target = event.target;
      if (!target.classList.contains("editable")) {
        return;
      }
      let componentItem = props.componentItem;
      let html = props.componentItem.html;

      // console.log("hovering >>>>>>");

      // await removeAllHover();
      // if (result) {
      // target.classList.add("hover");

      if (currentHoverElementId.value) {
        const jsonIndex = getComponentElementIndexUsingId(
          componentItem,
          currentHoverElementId.value
        );

        if (jsonIndex > -1) {
          let element = removeHoverClassFromElement(
            componentItem.json[jsonIndex]
          );
          html = updateElementDom(html, element, true);
          // eslint-disable-next-line vue/no-mutating-props
          props.componentItem.html = html;
        }
      }

      const elementId = target.id;
      currentHoverElementId.value = elementId;

      const jsonIndex = getComponentElementIndexUsingId(
        componentItem,
        elementId
      );
      componentItem.json[jsonIndex] = addHoverClassToElement(
        componentItem.json[jsonIndex]
      );
      // workspaceComponents.value[props.itemIndex] = componentItem;
      // store.commit(
      //   "canvas/SET_WORKSPACE_COMPONENTS",
      //   workspaceComponents.value
      // );
      html = updateElementDom(html, componentItem.json[jsonIndex], true);
      // eslint-disable-next-line vue/no-mutating-props
      props.componentItem.html = html;
      // }
    };

    const handleMouseLeave = (event: any) => {
      const target = event.target;
      target.classList.remove("hover");
    };

    const removePrevHover = async (componentItem: any, html: any) => {
      if (currentHoverElementId.value) {
        const jsonIndex = getComponentElementIndexUsingId(
          componentItem,
          currentHoverElementId.value
        );

        if (jsonIndex > -1) {
          let element = removeHoverClassFromElement(
            componentItem.json[jsonIndex]
          );
          html = updateElementDom(html, element, true);
          // eslint-disable-next-line vue/no-mutating-props
          props.componentItem.html = html;
        }
      }
    };

    const removeAllHover = async () => {
      // return new Promise<void>((resolve) => {
      //   setTimeout(() => {
      //     const hovers = document.querySelectorAll(".hover");
      //     for (let i = 0; i < hovers.length; i++) {
      //       hovers[i].classList.remove("hover");
      //     }
      //     resolve();
      //   }, 0); // Simulating an asynchronous operation with setTimeout
      // });
      // const hovers = document.querySelectorAll(".hover");
      // for (let i = 0; i < hovers.length; i++) {
      //   hovers[i].classList.remove("hover");
      // }
      // for (let i = 0; i < workspaceComponents.value.length; i++) {
      //   hovers[i].classList.remove("hover");
      // }

      for (let workspaceComponent of workspaceComponents.value) {
        for (let element of workspaceComponent.json) {
          element.classes =
            element.classes &&
            typeof element.classes === "object" &&
            element.classes.includes("hover")
              ? element.classes.filter((classs: string) => classs !== "hover")
              : element.classes;
          workspaceComponent.html = updateElementDom(
            workspaceComponent.html,
            element,
            true
          );
        }
      }
      // return true;
    };

    const removeAllFocus = () => {
      const elements = document.querySelectorAll(".focus");
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("focus");
      }
    };

    return {
      classes,
      moveComponentItemPosition,
      changeComponentItemPosition,
      handleClick,
      handleMouseOver,
      handleMouseLeave,
    };
  },
});
</script>

<template>
  <div class="layers__component__item">
    <div class="layers__component__item__header">
      <BaseIcon icon="canvas/sidebar/layers/dots" />
      <BaseIcon icon="canvas/sidebar/layers/open" />
      <BaseIcon icon="canvas/sidebar/layers/component" />
      <h5 class="layers__component__item__title">Component</h5>
    </div>

    <div class="layers__component__item__elements">
      <LayersContainerElementItem
        v-for="element in componentItem.json"
        :key="element.id"
        @mouseover.stop="handleMouseOver(element, $event)"
        @click="handleClick(element)"
        :element="element"
        :componentItem="componentItem"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import LayersContainerElementItem from "@/components/canvas/sidebar/layers/LayersContainerElementItem.vue";
import { layers } from "@/composables/canvas/layers";
import { updateDom } from "@/composables/canvas/update_dom";
import store from "@/store";

export default defineComponent({
  name: "LayersContainerItem",
  components: { LayersContainerElementItem, BaseIcon },
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
    const {
      getComponentElementIndexUsingId,
      addClassToElement,
      removeClassFromElement,
    } = layers();

    const { updateElementDom } = updateDom();

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const currentHoverElement = computed(() => {
      return store.getters["canvas/currentHoverElement"];
    });

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    const hasFocused = computed(() => {
      return focusedElement.value !== null && focusedIndex.value !== null;
    });

    const handleMouseOver = async (element: any, event: any) => {
      if (
        element.classes &&
        typeof element.classes === "object" &&
        element.classes.includes("focus")
      ) {
        return;
      }

      if (
        currentHoverElement.value.id &&
        currentHoverElement.value.componentIndex > -1
      ) {
        let currentComponentItem =
          workspaceComponents.value[currentHoverElement.value.componentIndex];

        const jsonIndex = getComponentElementIndexUsingId(
          currentComponentItem,
          currentHoverElement.value.id
        );

        if (jsonIndex > -1) {
          let currElement = currentComponentItem.json[jsonIndex];

          if (
            currElement.classes &&
            typeof currElement.classes == "object" &&
            currElement.classes.includes("hover")
          ) {
            currElement = removeClassFromElement(
              currentComponentItem.json[jsonIndex]
            );

            workspaceComponents.value[
              currentHoverElement.value.componentIndex
            ].html = updateElementDom(
              currentComponentItem.html,
              currElement,
              true
            );
          }
        }
      }

      const elementId = element.id;
      const componentItem = props.componentItem;
      const itemIndex = props.itemIndex;

      store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
        id: elementId,
        componentIndex: itemIndex,
      });
      const jsonIndex = getComponentElementIndexUsingId(
        componentItem,
        elementId
      );
      componentItem.json[jsonIndex] = addClassToElement(
        componentItem.json[jsonIndex]
      );
      workspaceComponents.value[itemIndex].html = updateElementDom(
        componentItem.html,
        componentItem.json[jsonIndex],
        true
      );
    };

    const handleClick = (element: any) => {
      if (hasFocused.value) {
        let focusedComponentItem =
          workspaceComponents.value[focusedIndex.value];

        const jsonIndex = getComponentElementIndexUsingId(
          focusedComponentItem,
          focusedElement.value.id
        );

        if (jsonIndex > -1) {
          let focusedElement = focusedComponentItem.json[jsonIndex];

          if (
            focusedElement.classes &&
            typeof focusedElement.classes == "object" &&
            focusedElement.classes.includes("focus")
          ) {
            focusedElement = removeClassFromElement(
              focusedComponentItem.json[jsonIndex],
              "focus"
            );
            workspaceComponents.value[focusedIndex.value].html =
              updateElementDom(focusedComponentItem.html, focusedElement, true);
          }
        }
      }
      const elementId = element.id;
      const componentItem = props.componentItem;
      const itemIndex = props.itemIndex;

      const jsonIndex = getComponentElementIndexUsingId(
        componentItem,
        elementId
      );

      componentItem.json[jsonIndex] = addClassToElement(
        componentItem.json[jsonIndex],
        "focus"
      );

      workspaceComponents.value[itemIndex].html = updateElementDom(
        componentItem.html,
        componentItem.json[jsonIndex],
        true
      );
      store.commit("canvas/SET_FOCUSED_ELEMENT", componentItem.json[jsonIndex]);
      store.commit("canvas/SET_FOCUSED_INDEX", itemIndex);
    };

    return { handleMouseOver, handleClick };
  },
});
</script>

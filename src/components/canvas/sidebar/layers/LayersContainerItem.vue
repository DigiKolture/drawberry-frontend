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
        @mouseover="handleMouseOver(element)"
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
      addHoverClassToElement,
      getComponentElementIndexUsingId,
      removeHoverClassFromElement,
    } = layers();

    const { updateElementDom } = updateDom();

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const currentHoverElement = computed(() => {
      return store.getters["canvas/currentHoverElement"];
    });

    const handleMouseOver = async (element: any) => {
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
            currElement = removeHoverClassFromElement(
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
      componentItem.json[jsonIndex] = addHoverClassToElement(
        componentItem.json[jsonIndex]
      );
      workspaceComponents.value[itemIndex].html = updateElementDom(
        componentItem.html,
        componentItem.json[jsonIndex],
        true
      );
    };
    return { handleMouseOver };
  },
});
</script>

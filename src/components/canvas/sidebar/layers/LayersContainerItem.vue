<template>
  <div class="layers__component__item">
    <LayersContainerElementItem
      @mouseover.stop="handleMouseOver(componentItem.json[0])"
      @click="handleClick(componentItem.json[0])"
      :element="componentItem.json[0]"
      :componentItem="componentItem"
      :header="true"
      :draggable="true"
      @dragstart.self="dragComponentItemLayer($event)"
      @drop="dropComponentItemLayer($event)"
      @dragover.prevent
      @dragenter.prevent
    >
      <div class="layers__component__item__header__move">
        <button>
          <BaseIcon icon="canvas/sidebar/layers/dots" />
        </button>
      </div>
      <button
        @click="toggleShowElements"
        class="layers__component__item__header__switch"
      >
        <BaseIcon
          :icon="`canvas/sidebar/layers/${showElements ? 'open' : 'closed'}`"
        />
      </button>
      <BaseIcon icon="canvas/sidebar/layers/component" />
      <h5 class="layers__component__item__title">Component</h5>
    </LayersContainerElementItem>

    <div v-if="showElements" class="layers__component__item__elements">
      <LayersContainerElementItem
        v-for="element in componentItem.json.slice(1)"
        :key="element.id"
        @mouseover.stop="handleMouseOver(element)"
        @click="handleClick(element)"
        :element="element"
        :componentItem="componentItem"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import LayersContainerElementItem from "@/components/canvas/sidebar/layers/LayersContainerElementItem.vue";
import { layers } from "@/composables/canvas/layers";
import { updateDom } from "@/composables/canvas/update_dom";
import store from "@/store";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { focus } from "@/composables/canvas/focus";

export default defineComponent({
  name: "LayersContainerItem",
  components: { LayersContainerElementItem, BaseIcon },
  props: {
    componentItem: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const {
      getComponentElementIndexUsingId,
      addClassToElement,
      removeClassFromElement,
    } = layers();

    const { changeComponentItemPosition } = drag_and_drop();

    const { updateElementDom } = updateDom();

    const { focusComponentElement, removeCurrentFocus } = focus();

    const showElements = ref(true);

    const toggleShowElements = () => {
      return (showElements.value = !showElements.value);
    };

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const project = computed(() => {
      return store.getters["projects/project"];
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

    watch(currentHoverElement, (val) => {
      // Allows layer component header to show elements when hovered
      // if (val && val.componentIndex == props.itemIndex) {
      // showElements.value = true;
      // }
    });

    const handleMouseOver = async (element: any) => {
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
      removeCurrentFocus();

      const elementId = element.id;
      const componentItem = props.componentItem;
      const itemIndex = props.itemIndex;

      const jsonIndex = getComponentElementIndexUsingId(
        componentItem,
        elementId
      );

      focusComponentElement(itemIndex, jsonIndex);
    };

    const dragComponentItemLayer = (e: any) => {
      const itemIndex = props.itemIndex;
      console.log("Drag Index", itemIndex);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("fromLayerComponentItemIndex", itemIndex);
    };

    const dropComponentItemLayer = async (e: any) => {
      const toIndex = props.itemIndex;
      const fromIndex = e.dataTransfer.getData("fromLayerComponentItemIndex");
      if (!fromIndex) return;

      await changeComponentItemPosition(
        project.value.id,
        parseInt(fromIndex),
        toIndex
      );
    };

    return {
      handleMouseOver,
      handleClick,
      toggleShowElements,
      showElements,
      dragComponentItemLayer,
      dropComponentItemLayer,
    };
  },
});
</script>

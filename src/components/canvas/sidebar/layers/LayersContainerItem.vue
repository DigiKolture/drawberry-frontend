<template>
  <div class="layers__component__item">
    <LayerElementDropIndicator v-if="dropIndex === itemIndex" />
    <LayersContainerElementItem
      @mouseover.stop="handleMouseOver(componentItem.json[0])"
      @click="handleClick(componentItem.json[0])"
      @dblclick="closeAllTabs"
      :element="componentItem.json[0]"
      :componentItem="componentItem"
      :item-index="itemIndex"
      :header="true"
      :draggable="true"
      @dragstart.self="dragComponentItemLayer($event)"
      @drop="dropComponentItemLayer($event)"
      @dragover="handleDragOver($event)"
      @dragleave="handleDragLeave($event)"
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
import { hover } from "@/composables/canvas/hover";
import store from "@/store";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { focus } from "@/composables/canvas/focus";
import LayerElementDropIndicator from "@/components/canvas/sidebar/layers/utilities/LayerElementDropIndicator.vue";
import { indicators } from "@/composables/canvas/indicators";

export default defineComponent({
  name: "LayersContainerItem",
  components: {
    LayerElementDropIndicator,
    LayersContainerElementItem,
    BaseIcon,
  },
  props: {
    componentItem: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: Number,
      required: true,
    },
    showElements: {
      type: Boolean,
      required: true,
    },
  },

  setup(props) {
    const { getComponentElementIndexUsingId } = layers();

    const { changeComponentItemPosition } = drag_and_drop();
    const { removeHoverElement, addHoverToElement } = hover();
    const { validateIndicator } = indicators();
    const { focusComponentElement, removeCurrentFocus } = focus();

    const dropIndex = ref(-1);

    const toggleShowElements = () => {
      store.commit("layers/TOGGLE_TAB_STATE", props.itemIndex);
    };

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const currentHoverElement = computed(() => {
      return store.getters["canvas/currentHoverElement"];
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

      removeHoverElement();

      const elementId = element.id;
      const componentItem = props.componentItem;
      const itemIndex = props.itemIndex;

      addHoverToElement(itemIndex, elementId, componentItem);
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
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("fromLayerComponentItemIndex", itemIndex);
    };

    const dropComponentItemLayer = async (e: any) => {
      const toIndex = props.itemIndex;
      const fromIndex = e.dataTransfer.getData("fromLayerComponentItemIndex");
      if (!fromIndex) return;

      dropIndex.value = -1;

      await changeComponentItemPosition(parseInt(fromIndex), toIndex);
    };

    const handleDragOver = (e: any) => {
      let fromIndex = e.dataTransfer.getData("fromLayerComponentItemIndex");
      let toIndex = props.itemIndex;

      const show = validateIndicator(fromIndex, toIndex);
      if (!show) return;

      dropIndex.value = props.itemIndex;
    };

    const handleDragLeave = () => {
      dropIndex.value = -1;
    };

    const closeAllTabs = () => {
      store.commit("layers/CLOSE_ALL_TAB_STATES");
    };

    return {
      dropIndex,
      handleMouseOver,
      handleClick,
      toggleShowElements,
      closeAllTabs,
      handleDragOver,
      handleDragLeave,
      dragComponentItemLayer,
      dropComponentItemLayer,
    };
  },
});
</script>

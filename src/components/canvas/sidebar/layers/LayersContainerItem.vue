<template>
  <div
    class="layers__component__item"
    :class="{
      focused: focusedIndex === itemIndex,
      hovered: currentHoverElement.componentIndex === itemIndex,
    }"
    :id="`layer-component-item-${itemIndex}`"
  >
    <LayerElementDropIndicator v-if="dropIndex === itemIndex" />
    <LayersContainerElementItem
      @mouseover.stop="handleMouseOver(componentItem.json[0])"
      @click="handleClick(componentItem.json[0])"
      :id="componentItem.json[0].id"
      @dblclick="closeAllTabs"
      :element="componentItem.json[0]"
      :componentItem="componentItem"
      :item-index="itemIndex"
      :header="true"
      :draggable="true"
      @dragstart.self="dragComponentItem($event)"
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
        @click.stop="toggleShowElements"
        class="layers__component__item__header__switch"
      >
        <BaseIcon
          :icon="`canvas/sidebar/layers/${showElements ? 'open' : 'closed'}`"
        />
      </button>
      <BaseIcon icon="canvas/sidebar/layers/component" />
      <h5 class="layers__component__item__title">
        {{ componentItem.componentItemName }}
      </h5>
    </LayersContainerElementItem>

    <div v-if="showElements" class="layers__component__item__elements">
      <LayersContainerElementItem
        v-show="!isChild(element)"
        v-for="element in componentItem.json.slice(1)"
        :id="element.id"
        :key="element.id"
        @mouseover.stop="handleMouseOver(element)"
        @click="handleClick(element)"
        :element="element"
        :item-index="itemIndex"
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
import { updateDom } from "@/composables/canvas/update_dom";

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
    const { getComponentElementIndexUsingId, dragComponentItemLayer } =
      layers();

    const { changeComponentItemPosition } = drag_and_drop();
    const { isChild } = updateDom();
    const { removeHoverElement, addHoverToElement } = hover();
    const { validateIndicator } = indicators();
    const { focusComponentElement, removeCurrentFocus, FOCUS_SCROLL_TYPES } =
      focus();

    const dropIndex = ref(-1);

    const toggleShowElements = () => {
      store.commit("layers/TOGGLE_TAB_STATE", props.itemIndex.toString());
    };

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
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
      // Dont add hover effect if the element is a parent or already in a focus state
      if (
        (element.classes &&
          typeof element.classes === "object" &&
          element.classes.includes("focus")) ||
        element.parent
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

      focusComponentElement(
        itemIndex,
        jsonIndex,
        FOCUS_SCROLL_TYPES.FROM_LAYER
      );
    };

    const dragComponentItem = (e: any) => {
      dragComponentItemLayer(e, props.itemIndex);
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
      isChild,
      focusedIndex,
      currentHoverElement,
      handleMouseOver,
      handleClick,
      toggleShowElements,
      closeAllTabs,
      handleDragOver,
      handleDragLeave,
      dragComponentItem,
      dropComponentItemLayer,
    };
  },
});
</script>

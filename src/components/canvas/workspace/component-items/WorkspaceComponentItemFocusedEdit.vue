<template>
  <div class="element-controls" :style="elementPositionStyle">
    <div v-if="showActions" class="element-controls__actions">
      <button
        draggable="true"
        ref="dragButtonRef"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
      >
        <BaseIcon icon="canvas/workspace/element/drag" />
      </button>
      <button @click="duplicate">
        <BaseIcon icon="canvas/workspace/element/duplicate" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, computed } from "vue";
import store from "@/store";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { duplicateElements } from "@/composables/canvas/duplicate";

export default defineComponent({
  name: "WorkspaceComponentItemFocusedEdit",
  components: { BaseIcon },
  props: {
    itemIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const selectedElementId = ref<string | null>(null);
    const elementPositionStyle = ref({ display: "none" }) as any;
    const showActions = ref<boolean>(true);
    const { duplicateItem } = duplicateElements();

    const actions = [
      { name: "drag", icon: "canvas/workspace/element/drag" },
      { name: "duplicate", icon: "canvas/workspace/element/duplicate" },
      { name: "display", icon: "canvas/workspace/element/display" },
    ];

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const focusedElementRef = ref<HTMLElement | null>(null) as any;

    const duplicate = () => {
      duplicateItem(focusedIndex.value, focusedElement.value.id);
    };

    const updateElementPosition = async () => {
      await nextTick(); // Wait for DOM updates

      if (focusedIndex.value === null || focusedElement.value === null) {
        elementPositionStyle.value = { display: "none" };
        return;
      }

      const componentContainer = document.getElementById(
        `workspace-component-item-${focusedIndex.value}`
      );
      // const componentContainer = document.getElementById(
      //   `workspace__component__items__list`
      // );

      if (!componentContainer) {
        elementPositionStyle.value = { display: "none" };
        return;
      }

      // const element = componentContainer.querySelector(".focus");
      const element = componentContainer.querySelector(
        `#${focusedElement.value.id}`
      );
      if (!element) {
        elementPositionStyle.value = { display: "none" };
        return;
      }

      // Hide actions if the focused element is the first element in the component
      const componentItem = workspaceComponents.value[focusedIndex.value];
      if (componentItem && componentItem.json[0].id === element.id) {
        showActions.value = false;
      } else {
        showActions.value = true;
      }

      const containerRect = componentContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      elementPositionStyle.value = {
        top: `${elementRect.top - containerRect.top}px`,
        left: `${elementRect.left - containerRect.left}px`,
        width: `${elementRect.width}px`,
        height: `${elementRect.height}px`,
        display: "block",
      };
      focusedElementRef.value = element;
    };

    // Watch for changes and update position
    watch(
      () => [
        store.getters["canvas/focusedIndex"],
        store.getters["canvas/focusedElement"],
        store.getters["canvas/workspaceComponents"],
      ],
      updateElementPosition,
      { immediate: true, deep: true }
    );

    const handleDragStart = (e: DragEvent) => {
      if (!focusedElementRef.value || !e.dataTransfer) return;
      const element = focusedElementRef.value;

      const elementId = `workspace-component-item-${focusedIndex.value}`;
      const componentEl = document.getElementById(elementId);
      if (!componentEl) return;

      store.commit("element/SET_IS_DRAGGING", true);
      store.commit("element/SET_LAST_DRAG_FROM_ELEMENT_ID", null);
      store.commit("element/SET_LAST_DRAG_TO_ELEMENT_ID", null);

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("fromItemElementId", focusedElementRef.value.id);

      const elementRect = element.getBoundingClientRect();
      const offsetX = e.clientX - elementRect.left;
      const offsetY = e.clientY - elementRect.top;

      e.dataTransfer.setDragImage(element, offsetX, offsetY);

      focusedElementRef.value.classList.add("dragging");
    };

    const handleDragEnd = () => {
      if (!focusedElementRef.value) return;

      focusedElementRef.value.classList.remove("dragging");
      store.commit("element/RESET_ELEMENT_DRAG_AND_DROP");
    };

    return {
      duplicate,
      selectedElementId,
      elementPositionStyle,
      actions,
      showActions,
      handleDragStart,
      handleDragEnd,
    };
  },
});
</script>

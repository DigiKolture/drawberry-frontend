<template>
  <div>
    <CanvasWorkspaceLoading v-if="canvasLoading" />
    <div
      class="canvas__workspace__container"
      id="canvas-workspace-container"
      @mouseover.self="handleMouseLeave"
    >
      <div
        id="canvas-workspace-items-container"
        class="workspace__component__items__container"
        :class="style.layout"
      >
        <CanvasWorkspaceEmpty
          :project-id="projectId"
          v-if="workspaceComponents.length === 0"
        />
        <WorkspaceComponentItemsListItem
          style="font-family: 'Agdasima', sans-serif"
          v-for="(componentItem, itemIndex) in workspaceComponents"
          :key="componentItem.id"
          @clicked="handleClick"
          @hover="handleMouseOver"
          :component-item="componentItem"
          :item-index="itemIndex"
          :project-id="projectId"
        />

        <WorkspaceLastComponentDecoy
          v-show="workspaceComponents.length > 0"
          :project-id="projectId"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import WorkspaceComponentItemsListItem from "./WorkspaceComponentItemsListItem.vue";
import CanvasWorkspaceEmpty from "../CanvasWorkspaceEmpty.vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import store from "@/store";
import { useRoute } from "vue-router";
import { layers } from "@/composables/canvas/layers";
import { hover } from "@/composables/canvas/hover";
import WebFont from "webfontloader";
import { focus } from "@/composables/canvas/focus";
import WorkspaceLastComponentDecoy from "@/components/canvas/workspace/component-items/WorkspaceLastComponentDecoy.vue";
import { fonts } from "@/composables/canvas/fonts";
import { CanvasLoadingState } from "@/store/modules/canvas/types";
import CanvasWorkspaceLoading from "@/components/canvas/workspace/CanvasWorkspaceSkeleton.vue";
import { canvas } from "@/composables/canvas/canvas";

export default defineComponent({
  name: "WorkspaceComponentItemsContainer",
  components: {
    CanvasWorkspaceLoading,
    WorkspaceLastComponentDecoy,
    CanvasWorkspaceEmpty,
    WorkspaceComponentItemsListItem,
  },

  setup() {
    const { upsertComponentItem } = drag_and_drop();
    const { removeHoverElement, addHoverToElement } = hover();
    const { removeFocus, removeCurrentFocus, focusComponentElement } = focus();
    const { extractUniqueFontFamilies } = fonts();
    const { getComponentElementIndexUsingId } = layers();
    const { canvasLoading } = canvas();

    const route = useRoute();
    const projectId = route.params.id as string;

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    const canvasLoadState = computed(() => {
      return store.getters["canvas/loadState"];
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const fontFamilies = computed(() => {
      return extractUniqueFontFamilies(workspaceComponents.value);
    });

    watch(fontFamilies, () => {
      if (fontFamilies.value.length === 0) return;
      WebFont.load({
        google: {
          families: fontFamilies.value,
        },
      });
    });

    onMounted(async () => {
      // Initialize hover element state
      store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
        id: null,
        componentIndex: null,
      });

      // store.commit("canvas/SET_LOAD_STATE", CanvasLoadingState.IN_PROGRESS);
      //
      // await Promise.all([
      //   store.dispatch("components/getComponents"),
      //   store.dispatch("canvas/getGoogleFonts"),
      //   store.dispatch("canvas/getProjectComponentItems", projectId),
      //   store.commit("projects/SET_PROJECT_ID", projectId),
      // ]);
      //
      // // Close all right panels and mark as mounted
      // store.commit("modals/CLOSE_ALL_RIGHT_PANELS");
      // store.commit("canvas/SET_LOAD_STATE", CanvasLoadingState.SUCCESS);

      // Remove focus
      removeFocus();
    });

    // onMounted(async () => {
    //   store.dispatch("canvas/getGoogleFonts");
    //   store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
    //     id: null,
    //     componentIndex: null,
    //   });
    // });
    //
    // onMounted(async () => {
    //   removeFocus();
    //
    //   store.commit("canvas/SET_LOAD_STATE", CanvasLoadingState.IN_PROGRESS);
    //
    //   //TODO: Look into the glitches that occuress before the page the styles is completely loaded
    //   await Promise.all([
    //     store.dispatch("canvas/getProjectComponentItems", projectId),
    //     store.commit("projects/SET_PROJECT_ID", projectId),
    //   ]);
    //   store.commit("modals/CLOSE_ALL_RIGHT_PANELS");
    //   store.commit("canvas/SET_LOAD_STATE", CanvasLoadingState.SUCCESS);
    // });

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const handleMouseOver = async (
      componentItem: any,
      itemIndex: any,
      event: any
    ) => {
      const target = event.target;
      if (
        !target.classList.contains("editable") ||
        target.classList.contains("focus") ||
        target.classList.contains("parent")
      ) {
        return;
      }
      const elementId = target.id;
      // console.log({ elementId });

      // If any of the component has an hover element, REMOVE it
      removeHoverElement();

      // ADD hover to the hovered element
      addHoverToElement(itemIndex, elementId, componentItem, event);
    };

    const handleCommandHold = async (
      componentItem: any,
      itemIndex: any,
      event: any
    ) => {
      const target = event.target;
      if (
        !target.classList.contains("editable") ||
        target.classList.contains("focus") ||
        target.classList.contains("parent")
      ) {
        return;
      }
      // const elementId = target.id;
      // If any of the component has an hover element, REMOVE it
      // removeHoverElement();
      //
      // // ADD hover to the hovered element
      // addHoverToElement(itemIndex, elementId, componentItem, event);
    };

    const handleMouseLeave = () => {
      removeHoverElement();
    };

    const handleClick = (
      componentItem: any,
      itemIndex: any,
      clicked: true, //click -> true, dbclick -> false
      event: any
    ) => {
      event.preventDefault();
      const target = event.target;
      let elementId = event.target.id;
      const parentId = event.target.getAttribute("parent");

      // If the target doesn't have the "editable" class, select the first item (whole component)
      if (!target.classList.contains("editable")) {
        elementId = componentItem.json[0].id;
      } else if (parentId) {
        // Check if the target has a parent with the specified parentId (its possible that the parentId is a child in the DOM (HTMl element)
        const isParentPresent = event.target.closest(`#${parentId}`);

        if (isParentPresent) {
          // If the parent exists in the DOM, set elementId to parentId
          elementId = parentId;
        } else {
          // If the parent doesn't exist, select the first item (whole component)
          elementId = componentItem.json[0].id;
        }
      }

      // TODO: Might remove
      removeCurrentFocus();

      const currentFocusedIndex = focusedIndex.value;
      let jsonIndex = 0; //Ensures the first element (whole component) is selected if the current component is not active

      // When clicked Only select/focus on child elements if the current component is active, if not select the whole component
      // If Command and click are pressed, you can select child elements on an inactive component
      if (clicked) {
        if (
          currentFocusedIndex === itemIndex ||
          event.metaKey ||
          event.ctrlKey
        ) {
          jsonIndex = getComponentElementIndexUsingId(componentItem, elementId);
        }
      }

      focusComponentElement(itemIndex, jsonIndex);
    };

    return {
      focusedElement,
      canvasLoading,
      fontFamilies,
      focusedIndex,
      workspaceComponents,
      upsertComponentItem,
      projectId,
      handleClick,
      style,
      handleMouseOver,
      handleCommandHold,
      handleMouseLeave,
    };
  },
});
</script>

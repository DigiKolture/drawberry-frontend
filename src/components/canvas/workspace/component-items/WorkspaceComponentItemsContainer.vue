<template>
  <div class="canvas__workspace__container" id="canvas-workspace-container">
    <CanvasWorkspaceLoading v-if="canvasLoading" />
    <CanvasBreakpointBar />
    <div
      class="canvas__workspace__items__cover"
      id="canvas-workspace-item-cover"
      @mouseover.self="handleMouseLeave"
      :style="styles"
      :class="breakpoint"
    >
      <div
        id="canvas-workspace-items-container"
        class="workspace__component__items__container"
        :class="style.layout"
      >
        <CanvasWorkspaceEmpty
          :project-id="projectId"
          v-if="workspaceComponents.length === 0 && !canvasLoading"
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
import { computed, defineComponent, onMounted, watch } from "vue";
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
import * as cheerio from "cheerio";
import { CanvasLoadingState } from "@/store/modules/canvas/types";
import CanvasWorkspaceLoading from "@/components/canvas/workspace/CanvasWorkspaceSkeleton.vue";
import { canvas } from "@/composables/canvas/canvas";
import { duplicateElements } from "@/composables/canvas/duplicate";
import CanvasBreakpointBar from "@/components/canvas/workspace/CanvasBreakpointBar.vue";

export default defineComponent({
  name: "WorkspaceComponentItemsContainer",
  components: {
    CanvasBreakpointBar,
    CanvasWorkspaceLoading,
    WorkspaceLastComponentDecoy,
    CanvasWorkspaceEmpty,
    WorkspaceComponentItemsListItem,
  },

  setup() {
    const { upsertComponentItem } = drag_and_drop();
    const { removeHoverElement, addHoverToElement } = hover();
    const { removeFocus, removeCurrentFocus, focusComponentElement } = focus();
    const { extractUniqueFontFamilies, addFontWeightsToFontFamilies } = fonts();
    const { getComponentElementIndexUsingId } = layers();
    const { canvasLoading, canvasLoaded } = canvas();

    const route = useRoute();
    const projectId = route.params.id as string;

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const breakpoint = computed(() => store.getters["canvas/breakpoint"]);

    const fontFamilies = computed(() => {
      return extractUniqueFontFamilies(workspaceComponents.value);
    });

    const styles = computed(() => {
      if (!canvasLoaded.value) {
        return {};
      }
      return {
        backgroundColor: style.value.backgroundColor,
        backgroundImage: `url('${style.value.backgroundImage}')`,
        backgroundSize: "cover",
      };
    });

    watch(fontFamilies, () => {
      if (fontFamilies.value.length === 0) return;
      WebFont.load({
        google: {
          families: addFontWeightsToFontFamilies(fontFamilies.value),
        },
      });
    });

    onMounted(async () => {
      // Initialize hover element state
      store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
        id: null,
        componentIndex: null,
      });

      // Remove focus
      removeFocus();
    });

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const handleMouseOver = async (
      componentItem: any,
      itemIndex: any,
      event: any
    ) => {
      // Use closest to find the nearest editable element (child or the wrapper itself)
      const target = (event.target as HTMLElement).closest(".editable");

      if (!target || target.classList.contains("focus")) {
        return;
      }

      if (target.classList.contains("parent")) {
        return;
      }

      const elementId = target.id;

      // Prevent the event from bubbling up to the main component container
      // and triggering multiple hover updates
      event.stopPropagation();

      //If any of the component has an hover element, REMOVE it
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
      clicked: true,
      event: any
    ) => {
      event.preventDefault();
      event.stopPropagation(); // Stop parent components from capturing the click

      // 1. Find the nearest editable element
      const editableTarget = (event.target as HTMLElement).closest(".editable");

      // If no editable found, default to the main component container
      if (!editableTarget) {
        focusComponentElement(itemIndex, 0);
        return;
      }

      let elementId = editableTarget.id;
      const parentIdAttr = editableTarget.getAttribute("parent");

      // 2. Handle the "parent" attribute redirect
      if (parentIdAttr) {
        // We check if the parentId actually exists in the current DOM tree
        // instead of using Cheerio load
        const parentExists =
          editableTarget.closest(`#${parentIdAttr}`) ||
          document.getElementById(parentIdAttr);

        if (parentExists) {
          elementId = parentIdAttr;
        } else {
          // Fallback to component root if the specified parent isn't found
          elementId = componentItem.json[0].id;
        }
      }

      removeCurrentFocus();

      const currentFocusedIndex = focusedIndex.value;
      let jsonIndex = 0;

      // 3. Selection Logic
      if (clicked) {
        // Only drill down into child elements if the component is already active
        // OR if the user is holding Cmd/Ctrl
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

    const handleClick2 = (
      componentItem: any,
      itemIndex: any,
      clicked: true, //click -> true, dbclick -> false
      event: any
    ) => {
      event.preventDefault();
      const target = event.target;
      let elementId = event.target.id;
      const parentId = event.target.getAttribute("parent");

      console.log({ elementId, parentId });

      const $ = cheerio.load(componentItem.html);

      // If the target doesn't have the "editable" class, select the first item (whole component)
      if (!target.classList.contains("editable")) {
        elementId = componentItem.json[0].id;
      } else if (parentId) {
        // Check if the target has a parent with the specified parentId (its possible that the parentId is a child in the DOM (HTMl element)
        // const isParentPresent = event.target.closest(`#${parentId}`);
        const targetElement = $(`#${elementId}`);
        const parentElement = $(`#${parentId}`);

        // Check if parent contains target OR target contains parent
        const isParentPresent =
          parentElement.length > 0 &&
          targetElement.length > 0 &&
          (parentElement.find(`#${elementId}`).length > 0 ||
            targetElement.find(`#${parentId}`).length > 0);

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

      console.log("elementId on click:", elementId);

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
      breakpoint,
      fontFamilies,
      focusedIndex,
      workspaceComponents,
      upsertComponentItem,
      projectId,
      handleClick,
      style,
      styles,
      handleMouseOver,
      handleCommandHold,
      handleMouseLeave,
    };
  },
});
</script>

<template>
  <div
    class="canvas__workspace__container"
    id="canvas-workspace-container"
    @mouseover.self="handleMouseLeave"
  >
    <div class="workspace__component__items__container" :class="style.layout">
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
        :is-mounted="isMounted"
      />

      <WorkspaceLastComponentDecoy
        v-show="workspaceComponents.length > 0"
        :project-id="projectId"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
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

export default defineComponent({
  name: "WorkspaceComponentItemsContainer",
  components: {
    WorkspaceLastComponentDecoy,
    CanvasWorkspaceEmpty,
    WorkspaceComponentItemsListItem,
  },

  setup() {
    const { upsertComponentItem } = drag_and_drop();
    const { removeHoverElement, addHoverToElement } = hover();
    const { removeFocus, removeCurrentFocus, focusComponentElement } = focus();

    const { getComponentElementIndexUsingId } = layers();

    const route = useRoute();
    const projectId = route.params.id as string;
    const isMounted = ref(false);

    const googleFonts = computed(() => {
      return store.getters["canvas/googleFonts"];
    });

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    onMounted(async () => {
      await store.dispatch("canvas/getGoogleFonts");
      const families = googleFonts.value.map((font: any) => font.family);

      WebFont.load({
        google: {
          families,
        },
      });
      store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
        id: null,
        componentIndex: null,
      });

      removeFocus();
    });

    onMounted(async () => {
      //TODO: Look into the glitches that occuress before the page the styles is completely loaded
      await Promise.all([
        store.dispatch("canvas/getProjectComponentItems", projectId),
        store.commit("projects/SET_PROJECT_ID", projectId),
      ]);
      store.commit("modals/CLOSE_ALL_RIGHT_PANELS");
      isMounted.value = true;
    });

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
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
      const elementId = target.id;

      console.log("<<< elementId >>>>");

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

      // If the focused element isnt an editable component or contains parent class
      if (
        !target.classList.contains("editable") ||
        target.classList.contains("parent")
      ) {
        elementId = componentItem.json[0].id;
      }

      removeCurrentFocus();

      const currentFocusedIndex = focusedIndex.value;
      let jsonIndex = 0;

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

      focusComponentElement(itemIndex, jsonIndex, true);
    };

    return {
      focusedElement,
      focusedIndex,
      workspaceComponents,
      upsertComponentItem,
      projectId,
      isMounted,
      handleClick,
      style,
      handleMouseOver,
      handleCommandHold,
      handleMouseLeave,
    };
  },
});
</script>

<template>
  <div
    class="canvas__workspace__container"
    @mouseover.self="handleMouseLeave($event)"
  >
    {{ focusedIndex }} - {{ focusedElement?.id }}
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
        v-if="workspaceComponents.length > 0"
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
import { updateDom } from "@/composables/canvas/update_dom";
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
    const { updateElementDom } = updateDom();
    const { removeHoverElement } = hover();
    const { removeFocus, removeCurrentFocus, focusComponentElement } = focus();

    const { addClassToElement, getComponentElementIndexUsingId } = layers();

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
        target.classList.contains("focus")
      ) {
        return;
      }

      // If any of the component has an hover element, REMOVE it
      removeHoverElement();

      // ADD hover to the hovered element
      const elementId = target.id;
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
        componentItem.json[jsonIndex]
      );
    };

    const handleMouseLeave = () => {
      removeHoverElement();
    };

    const handleClick = (componentItem: any, itemIndex: any, event: any) => {
      event.preventDefault();
      const target = event.target;
      const elementId = event.target.id;
      if (!target.classList.contains("editable")) {
        return;
      }

      removeCurrentFocus();

      const jsonIndex = getComponentElementIndexUsingId(
        componentItem,
        elementId
      );

      focusComponentElement(itemIndex, jsonIndex);
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
      handleMouseLeave,
    };
  },
});
</script>

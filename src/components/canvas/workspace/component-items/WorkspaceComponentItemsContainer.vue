<template>
  <div
    class="workspace__component__items__container"
    :class="style.layout"
    @drop.self="upsertComponentItem($event, 0, projectId)"
    @dragover.prevent
    @dragenter.prevent
  >
    <CanvasWorkspaceEmpty v-if="workspaceComponents.length === 0" />
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
import WebFont from "webfontloader";

export default defineComponent({
  name: "WorkspaceComponentItemsContainer",
  components: {
    CanvasWorkspaceEmpty,
    WorkspaceComponentItemsListItem,
  },

  setup() {
    const { upsertComponentItem } = drag_and_drop();

    const { updateElementDom } = updateDom();
    const {
      addClassToElement,
      removeClassFromElement,
      getComponentElementIndexUsingId,
    } = layers();

    const route = useRoute();
    const projectId = route.params.id as string;
    const isMounted = ref(false);

    const googleFonts = computed(() => {
      return store.getters["canvas/googleFonts"];
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
      store.commit("canvas/SET_FOCUSED_ELEMENT", null);
      store.commit("canvas/SET_FOCUSED_INDEX", null);
    });

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

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

    onMounted(async () => {
      //TODO: Look into the glitches that occuress before the page the styles is completely loaded
      await Promise.all([
        store.dispatch("canvas/getProjectComponentItems", projectId),
        store.commit("projects/SET_PROJECT_ID", projectId),
      ]);
      isMounted.value = true;
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
      if (
        currentHoverElement.value.id &&
        currentHoverElement.value.componentIndex !== null &&
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
        componentItem.json[jsonIndex],
        true
      );
    };

    const handleClick = (componentItem: any, itemIndex: any, event: any) => {
      event.preventDefault();
      const target = event.target;
      const elementId = event.target.id;
      if (!target.classList.contains("editable")) {
        return;
      }
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

      const jsonIndex = getComponentElementIndexUsingId(
        componentItem,
        elementId
      );

      if (jsonIndex > -1) {
        componentItem.json[jsonIndex] = addClassToElement(
          componentItem.json[jsonIndex],
          "focus"
        );

        workspaceComponents.value[itemIndex].html = updateElementDom(
          componentItem.html,
          componentItem.json[jsonIndex],
          true
        );
        store.commit(
          "canvas/SET_FOCUSED_ELEMENT",
          componentItem.json[jsonIndex]
        );
        store.commit("canvas/SET_FOCUSED_INDEX", itemIndex);
      }
    };

    return {
      workspaceComponents,
      upsertComponentItem,
      projectId,
      isMounted,
      handleClick,
      style,
      handleMouseOver,
    };
  },
});
</script>

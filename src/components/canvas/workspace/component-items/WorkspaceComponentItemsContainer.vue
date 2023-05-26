<template>
  <div
    class="workspace__component__items__container"
    @drop.self="changeComponentItemPosition($event, 0, projectId)"
    @dragover.prevent
    @dragenter.prevent
  >
    <CanvasWorkspaceEmpty v-if="workspaceComponents.length === 0" />

    <WorkspaceComponentItemsListItem
      v-for="(componentItem, itemIndex) in workspaceComponents"
      :key="componentItem.id"
      @mouseover="handleMouseOver(componentItem, itemIndex, $event)"
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

export default defineComponent({
  name: "WorkspaceComponentItemsContainer",
  components: {
    CanvasWorkspaceEmpty,
    WorkspaceComponentItemsListItem,
  },

  setup() {
    const { changeComponentItemPosition } = drag_and_drop();

    const { updateElementDom } = updateDom();
    const {
      addHoverClassToElement,
      getComponentElementIndexUsingId,
      removeHoverClassFromElement,
    } = layers();

    const route = useRoute();
    const projectId = route.params.id as string;
    const isMounted = ref(false);

    onMounted(() => {
      store.commit("canvas/SET_CURRENT_HOVER_ELEMENT", {
        id: null,
        componentIndex: null,
      });
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const currentHoverElement = computed(() => {
      return store.getters["canvas/currentHoverElement"];
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
      if (!target.classList.contains("editable")) {
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

      const elementId = target.id;
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

    return {
      workspaceComponents,
      changeComponentItemPosition,
      projectId,
      isMounted,
      handleMouseOver,
    };
  },
});
</script>

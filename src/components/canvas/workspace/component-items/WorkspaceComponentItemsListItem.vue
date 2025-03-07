<template>
  <div class="workspace__component__items__list">
    <WorkspaceComponentDropIndicator v-if="dropIndex === itemIndex" />
    <WorkspaceComponentDropSkeleton v-if="dropLoadingIndex === itemIndex" />
    <div
      class="workspace__component__items__list__item"
      :class="{
        focused: focusedIndex === itemIndex,
        hovered: currentHoverElement.componentIndex === itemIndex,
      }"
      v-html="componentItem.html"
      :id="`workspace-component-item-${itemIndex}`"
      :draggable="true"
      @dragstart="moveComponentItemPosition($event, itemIndex)"
      @drop="dropComponent($event, itemIndex, projectId)"
      @dblclick="dbClickEvent"
      @click="clickEvent($event)"
      @keyup="handleKeyUp($event)"
      @mouseover.stop="hoverEvent($event)"
      @dragover="handleDragOver($event)"
      @dragend="handleDragEnd($event)"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover.prevent
      @dragenter.prevent
      v-if="canvasLoaded"
    ></div>
    <WorkspaceComponentItemsActions
      v-if="showActions"
      :component-item="componentItem"
      :project-id="projectId"
      :item-index="itemIndex"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { updateDom } from "@/composables/canvas/update_dom";
import store from "@/store";
import WorkspaceComponentItemsActions from "@/components/canvas/workspace/component-items/WorkspaceComponentItemsActions.vue";
import WorkspaceComponentDropSkeleton from "@/components/canvas/workspace/utilities/WorkspaceComponentDropSkeleton.vue";
import WorkspaceComponentDropIndicator from "@/components/canvas/workspace/utilities/WorkspaceComponentDropIndicator.vue";
import { indicators } from "@/composables/canvas/indicators";
import { ui } from "@/assets/js/canvas";
import { canvas } from "@/composables/canvas/canvas";

export default defineComponent({
  name: "WorkspaceComponentItemsListItem",
  components: {
    WorkspaceComponentDropIndicator,
    WorkspaceComponentDropSkeleton,
    WorkspaceComponentItemsActions,
  },
  props: {
    projectId: {
      type: String,
      required: true,
    },
    componentItem: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: Number,
      required: true,
    },
  },

  setup(props, { emit }) {
    const {
      moveComponentItemPosition,
      upsertComponentItem,
      handleScroll,
      stopScrolling,
    } = drag_and_drop();
    const { validateWorkspaceIndicator } = indicators();
    const { canvasLoaded } = canvas();

    const { updateElementDom } = updateDom();
    const disabledButton = ref(false);

    const dropIndex = ref(-1);
    const dropLoadingIndex = ref(-1);
    const intervalId = ref<number | null>(null);

    onMounted(() => {
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);
    });

    const classes = computed(() => {
      return props.componentItem.json.map((el: any) => el.classes);
    });

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const canvasLoadState = computed(() => {
      return store.getters["canvas/loadState"];
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    watch(canvasLoaded, (value) => {
      if (value) {
        loadStylesForComponent(props);
      }
    });

    const disabledTopModifyPosition = computed(() => {
      return disabledButton.value || props.itemIndex === 0;
    });

    const disabledBottomModifyPosition = computed(() => {
      return (
        disabledButton.value ||
        props.itemIndex === workspaceComponents.value.length - 1
      );
    });

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    const currentHoverElement = computed(() => {
      return store.getters["canvas/currentHoverElement"];
    });

    const showActions = computed(() => {
      if (focusedIndex.value == null || focusedIndex.value != props.itemIndex)
        return false;

      const firstWorkspaceComponentElement =
        workspaceComponents.value[focusedIndex.value].json[0];

      return (
        focusedElement.value &&
        firstWorkspaceComponentElement.id == focusedElement.value.id
      );
    });

    const loadStylesForComponent = (props: any) => {
      let html = props.componentItem.html;
      const json = props.componentItem.json;

      for (let elementJson of json) {
        // if (!elementJson.attributes.style.value) continue;
        html = updateElementDom(html, elementJson);
      }
      //eslint-disable-next-line vue/no-mutating-props
      props.componentItem.html = html;
    };

    const handleDragOver = (e: any) => {
      const fromIndex = e.dataTransfer.getData("fromComponentItemIndex");
      const type = e.dataTransfer.getData("type");
      const toIndex = props.itemIndex;

      ui.changeComponentItemsStatus(false);

      handleScroll(e);

      const show = validateWorkspaceIndicator(type, fromIndex, toIndex);
      if (!show) return;

      dropIndex.value = props.itemIndex;
    };

    const handleDragEnd = () => {
      store.commit("canvas/SET_SCROLL_INTERVAL_IDS", []);
    };
    const handleDragEnter = () => {
      // console.log(`<<<<<< HANDLE DRAG ENTER >>>>> ${props.itemIndex}`);
    };

    const handleDragLeave = () => {
      dropIndex.value = -1;
    };

    const clickEvent = (event: any) => {
      emit("clicked", props.componentItem, props.itemIndex, true, event);
    };

    const handleKeyUp = (event: any) => {
      console.log("-------");
      if (event.key === "Meta" || event.key === "Control") {
        console.log("---------------");
        emit("keyuped", props.componentItem, props.itemIndex, event);
      }
    };

    const dbClickEvent = (event: any) => {
      console.log("<<<<< >>>>>");
      // emit("dbclicked", props.componentItem, props.itemIndex, false, event);
    };

    const hoverEvent = (event: any) => {
      emit("hover", props.componentItem, props.itemIndex, event);
    };

    const dropComponent = async (
      event: Event,
      itemIndex: number,
      projectId: string
    ) => {
      // stopScrolling();
      dropLoadingIndex.value = dropIndex.value;
      dropIndex.value = -1;
      await upsertComponentItem(event, itemIndex, projectId);
      dropLoadingIndex.value = -1;
    };

    return {
      dropIndex,
      canvasLoadState,
      canvasLoaded,
      dropLoadingIndex,
      disabledButton,
      classes,
      focusedIndex,
      currentHoverElement,
      showActions,
      clickEvent,
      handleKeyUp,
      dbClickEvent,
      hoverEvent,
      handleDragOver,
      handleDragEnter,
      handleDragEnd,
      handleDragLeave,
      dropComponent,
      moveComponentItemPosition,
      upsertComponentItem,
      disabledTopModifyPosition,
      disabledBottomModifyPosition,
    };
  },
});
</script>

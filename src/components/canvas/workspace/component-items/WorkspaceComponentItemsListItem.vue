<template>
  <div class="workspace__component__items__list">
    <WorkspaceComponentDropIndicator v-if="dropIndex === itemIndex" />
    <WorkspaceComponentDropSkeleton v-if="dropLoadingIndex === itemIndex" />
    <div
      class="workspace__component__items__list__item"
      v-html="componentItem.html"
      :id="`workspace-component-item-${itemIndex}`"
      :draggable="true"
      @dragstart="moveComponentItemPosition($event, itemIndex)"
      @drop="dropComponent($event, itemIndex, projectId)"
      @click="clickEvent($event)"
      @mouseover.stop="hoverEvent($event)"
      @dragover="handleDragOver($event)"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover.prevent
      @dragenter.prevent
      v-if="isMounted"
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
    isMounted: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const { moveComponentItemPosition, upsertComponentItem } = drag_and_drop();
    const { validateWorkspaceIndicator } = indicators();

    const { updateElementDom } = updateDom();
    const disabledButton = ref(false);

    const dropIndex = ref(-1);
    const dropLoadingIndex = ref(-1);

    onMounted(() => {
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);
    });

    const classes = computed(() => {
      return props.componentItem.json.map((el: any) => el.classes);
    });

    watch(
      () => props.isMounted,
      (value) => {
        if (value) {
          loadStylesForComponent(props);
        }
      }
    );

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
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
        if (!elementJson.attributes.style.value) continue;
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

      const show = validateWorkspaceIndicator(type, fromIndex, toIndex);
      if (!show) return;

      dropIndex.value = props.itemIndex;
    };
    const handleDragEnter = () => {
      // console.log(`<<<<<< HANDLE DRAG ENTER >>>>> ${props.itemIndex}`);
    };

    const handleDragLeave = () => {
      dropIndex.value = -1;
    };

    const clickEvent = (event: any) => {
      emit("clicked", props.componentItem, props.itemIndex, event);
    };

    const hoverEvent = (event: any) => {
      emit("hover", props.componentItem, props.itemIndex, event);
    };

    const dropComponent = async (
      event: Event,
      itemIndex: number,
      projectId: string
    ) => {
      dropLoadingIndex.value = dropIndex.value;
      dropIndex.value = -1;
      await upsertComponentItem(event, itemIndex, projectId);
      dropLoadingIndex.value = -1;
    };

    return {
      dropIndex,
      dropLoadingIndex,
      disabledButton,
      classes,
      showActions,
      clickEvent,
      hoverEvent,
      handleDragOver,
      handleDragEnter,
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

<template>
  <div class="workspace__component__items__list">
    <div
      class="workspace__component__items__list__item"
      v-html="componentItem.html"
      :draggable="true"
      @dragstart.self="moveComponentItemPosition($event, itemIndex)"
      @drop="upsertComponentItem($event, itemIndex, projectId)"
      @click="clickEvent($event)"
      @mouseover.stop="hoverEvent($event)"
      @dragover.prevent
      @dragenter.prevent
      v-if="isMounted"
    ></div>
    <div v-if="showActions" class="workspace__component__actions">
      <div class="workspace__component__actions__top">
        <BaseButtonIcon class="copy" icon="canvas/workspace/copy" />
        <BaseButtonIcon icon="canvas/workspace/duplicate" />
        <BaseButtonIcon icon="canvas/workspace/delete" />
      </div>
      <div class="workspace__component__actions__bottom">
        <BaseButtonIcon
          :disabled="disabledTopModifyPosition"
          @click="modifyComponentPosition(false)"
          icon="arrow/up"
        />
        <BaseButtonIcon
          :disabled="disabledBottomModifyPosition"
          @click="modifyComponentPosition()"
          icon="arrow/down"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, watch } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { updateDom } from "@/composables/canvas/update_dom";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "WorkspaceComponentItemsListItem",
  components: { BaseButtonIcon },
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
    const {
      moveComponentItemPosition,
      upsertComponentItem,
      changeComponentItemPosition,
    } = drag_and_drop();

    const { updateElementDom } = updateDom();

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
      return props.itemIndex === 0;
    });

    const disabledBottomModifyPosition = computed(() => {
      return props.itemIndex === workspaceComponents.value.length - 1;
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

    const clickEvent = (event: any) => {
      emit("clicked", props.componentItem, props.itemIndex, event);
    };

    const hoverEvent = (event: any) => {
      emit("hover", props.componentItem, props.itemIndex, event);
    };

    const modifyComponentPosition = async (increment = true) => {
      const currentIndex = props.itemIndex;
      const updatedIndex = increment
        ? props.itemIndex + 1
        : props.itemIndex - 1;
      if (increment) {
        await changeComponentItemPosition(
          props.projectId,
          currentIndex,
          updatedIndex
        );
      } else {
        await changeComponentItemPosition(
          props.projectId,
          currentIndex,
          updatedIndex
        );
      }
      store.commit("canvas/SET_FOCUSED_INDEX", updatedIndex);
    };

    return {
      classes,
      showActions,
      clickEvent,
      modifyComponentPosition,
      hoverEvent,
      moveComponentItemPosition,
      upsertComponentItem,
      disabledTopModifyPosition,
      disabledBottomModifyPosition,
    };
  },
});
</script>

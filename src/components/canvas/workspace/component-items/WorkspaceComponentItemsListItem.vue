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
        <BaseButtonIcon icon="arrow/up" />
        <BaseButtonIcon icon="arrow/down" />
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
      type: [Number, String],
      required: true,
    },
    isMounted: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const { moveComponentItemPosition, upsertComponentItem } = drag_and_drop();

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

    return {
      classes,
      showActions,
      clickEvent,
      hoverEvent,
      moveComponentItemPosition,
      upsertComponentItem,
    };
  },
});
</script>

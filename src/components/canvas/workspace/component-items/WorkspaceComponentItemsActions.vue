<template>
  <div class="workspace__component__item__actions">
    <div class="workspace__component__actions__top">
      <BaseButtonIcon
        :disabled="disabledButton"
        @click="duplicateProjectComponent"
        icon="canvas/workspace/duplicate"
      />
      <BaseButtonIcon
        :disabled="disabledButton"
        @click="deleteProjectComponent"
        icon="canvas/workspace/delete"
      />
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
</template>
<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "WorkspaceComponentItemsActions",
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
  },
  setup(props) {
    const {
      moveComponentItemPosition,
      upsertComponentItem,
      changeComponentItemPosition,
    } = drag_and_drop();

    const disabledButton = ref(false);

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

    const modifyComponentPosition = async (increment = true) => {
      const currentIndex = props.itemIndex;
      const updatedIndex = increment
        ? props.itemIndex + 1
        : props.itemIndex - 1;
      store.commit("canvas/SET_FOCUSED_INDEX", updatedIndex);

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
    };

    const duplicateProjectComponent = async () => {
      disabledButton.value = true;
      const projectComponentItem = workspaceComponents.value[props.itemIndex];

      await store.dispatch("canvas/duplicateProjectComponent", {
        projectId: props.projectId,
        projectComponentItemId: projectComponentItem.id,
        positionIndex: props.itemIndex + 1,
      });

      disabledButton.value = false;
    };

    const deleteProjectComponent = async () => {
      disabledButton.value = true;
      const projectComponentItem = workspaceComponents.value[props.itemIndex];

      await store.dispatch("canvas/deleteProjectComponent", {
        projectId: props.projectId,
        projectComponentItemId: projectComponentItem.id,
        positionIndex: props.itemIndex,
      });
      store.commit("canvas/SET_FOCUSED_ELEMENT", null);
      store.commit("canvas/SET_FOCUSED_INDEX", null);

      disabledButton.value = false;
    };

    return {
      disabledButton,
      modifyComponentPosition,
      moveComponentItemPosition,
      upsertComponentItem,
      duplicateProjectComponent,
      deleteProjectComponent,
      disabledTopModifyPosition,
      disabledBottomModifyPosition,
    };
  },
});
</script>

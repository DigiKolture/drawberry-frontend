<template>
  <div
    :draggable="true"
    class="component__items__list__item"
    v-html="componentItem.html"
    @dragstart="dragComponentItemToCanvas($event, itemIndex)"
    @click="clickEvent($event)"
  ></div>
</template>
<script>
import { computed, defineComponent, ref } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { useRoute } from "vue-router";
import store from "@/store";
import { focus } from "@/composables/canvas/focus";
const { dragComponentItemToCanvas } = drag_and_drop();

export default defineComponent({
  name: "ComponentItemsContainerListItem",

  props: {
    componentItem: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: [Number, String],
      required: true,
    },
  },

  setup(props, { emit }) {
    const route = useRoute();
    const { removeCurrentFocus, removeFocus } = focus();

    const disabled = ref(false);

    const componentItems = computed(() => {
      return store.getters["components/componentItems"];
    });

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const clickEvent = async (event) => {
      event.preventDefault();

      const projectId = route.params.id;

      const componentItem = componentItems.value[parseInt(props.itemIndex)];
      if (!componentItem || !projectId) return;

      emit("disable");

      removeCurrentFocus();
      removeFocus();

      await store.dispatch("canvas/storeProjectComponent", {
        projectId,
        data: {
          componentItemId: componentItem.id,
          positionIndex: workspaceComponents.value.length,
        },
      });

      emit("enable");
    };

    return {
      disabled,
      dragComponentItemToCanvas,
      clickEvent,
    };
  },
});
</script>

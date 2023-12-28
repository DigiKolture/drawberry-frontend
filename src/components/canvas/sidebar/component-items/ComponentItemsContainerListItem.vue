<template>
  <div
    :draggable="true"
    class="component__items__list__item sm"
    v-html="componentItem.html"
    @dragstart="dragComponentItemToCanvas($event, itemIndex)"
    @click="clickEvent($event)"
  ></div>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";
import { useRoute } from "vue-router";
import store from "@/store";
import { focus } from "@/composables/canvas/focus";
import { ui } from "@/assets/js/canvas";
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
    const { removeCurrentFocus, removeFocus, scrollTo } = focus();

    onMounted(() => {
      store.commit("canvas/SET_DROP_LOADING", false);
    });

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

      ui.changeComponentItemsStatus(false);

      emit("disable");
      // scrollTo(workspaceComponents.value.length - 1, false);

      store.commit("canvas/SET_DROP_LOADING", true);
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });

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
      store.commit("canvas/SET_DROP_LOADING", false);
    };

    return {
      disabled,
      dragComponentItemToCanvas,
      clickEvent,
    };
  },
});
</script>

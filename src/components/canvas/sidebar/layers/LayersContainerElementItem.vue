<template>
  <div
    v-if="!header"
    :class="{ hover: isHover, focus: isFocus }"
    class="layers__component__item__element"
  >
    <BaseIcon :icon="icon" />
    <h5>{{ title }}</h5>
  </div>
  <div
    v-else
    :class="{ hover: isHover, focus: isFocus }"
    class="layers__component__item__header"
  >
    <slot />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { layers } from "@/composables/canvas/layers";
import store from "@/store";

export default defineComponent({
  name: "LayersContainerElementItem",
  components: { BaseIcon },
  props: {
    element: {
      type: Object,
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
    header: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup(props) {
    const { getLayerElementTitle, getLayerElementIcon } = layers();

    const title = getLayerElementTitle(props.element);
    const icon = getLayerElementIcon(props.element);

    const focusedIndex = computed(() => {
      return store.getters["canvas/focusedIndex"];
    });

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const isActive = (state: string) => {
      return (
        props.itemIndex === focusedIndex.value &&
        props.element.id === focusedElement.value?.id
      );
    };

    const isActive2 = (state: string) => {
      return (
        props.element.classes &&
        typeof props.element.classes == "object" &&
        props.element.classes.includes(state)
      );
    };

    const isHover = computed(() => {
      return isActive("hover");
    });

    const isFocus = computed(() => {
      return isActive("focus");
    });

    return {
      title,
      icon,
      isHover,
      isFocus,
    };
  },
});
</script>

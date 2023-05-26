<template>
  <div :class="{ active: isActive }" class="layers__component__item__element">
    <BaseIcon :icon="icon" />
    <h5>{{ title }}- {{ element.classes }}</h5>
    <!--    <h5>{{ title }}</h5>-->
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { layers } from "@/composables/canvas/layers";

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
  },

  setup(props) {
    const { getLayerElementTitle, getLayerElementIcon } = layers();

    const title = getLayerElementTitle(props.element);
    const icon = getLayerElementIcon(props.element);

    const isActive = computed(() => {
      return (
        props.element.classes &&
        typeof props.element.classes == "object" &&
        (props.element.classes.includes("hover") ||
          props.element.classes.includes("focus"))
      );
    });

    return {
      title,
      icon,
      isActive,
    };
  },
});
</script>

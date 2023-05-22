<template>
  <div class="layers__component__item__element">
    <BaseIcon :icon="icon" />
    <h5>{{ title }}</h5>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
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
  },

  setup(props) {
    const { getLayerElementTitle, getLayerElementIcon } = layers();

    const title = getLayerElementTitle(props.element);
    const icon = getLayerElementIcon(props.element);

    return {
      title,
      icon,
    };
  },
});
</script>

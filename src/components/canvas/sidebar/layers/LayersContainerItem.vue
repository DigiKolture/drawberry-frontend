<template>
  <div class="layers__component__item">
    <div class="layers__component__item__header">
      <BaseIcon icon="canvas/sidebar/layers/dots" />
      <BaseIcon icon="canvas/sidebar/layers/open" />
      <BaseIcon icon="canvas/sidebar/layers/component" />
      <h5 class="layers__component__item__title">Component</h5>
    </div>

    <div class="layers__component__item__elements">
      <LayersContainerElementItem
        v-for="element in component.json"
        :key="element.id"
        :element="element"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import LayersContainerElementItem from "@/components/canvas/sidebar/layers/LayersContainerElementItem.vue";

export default defineComponent({
  name: "LayersContainerItem",
  components: { LayersContainerElementItem, BaseIcon },
  props: {
    component: {
      type: Object,
      required: true,
    },
  },
});
</script>

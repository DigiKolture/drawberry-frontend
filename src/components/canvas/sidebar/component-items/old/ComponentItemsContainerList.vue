<template>
  <ComponentItemsContainerListItem
    v-for="(componentItem, itemIndex) in componentItems"
    :key="componentItem.id"
    :component-item="componentItem"
    :item-index="itemIndex"
  />
</template>
<script>
import { computed, defineComponent } from "vue";
import ComponentItemsContainerListItem from "./ComponentItemsContainerListItem";
import store from "@/store";

export default defineComponent({
  name: "ComponentItemsContainerList",
  components: { ComponentItemsContainerListItem },

  setup() {
    const componentItems = computed(() => {
      return store.getters["components/componentItems"];
    });

    return {
      componentItems,
    };
  },
});
</script>

<template>
  <div class="component__items__container hide" id="component-items">
    <ComponentItemsContainerListItem
      v-for="(componentItem, itemIndex) in componentItems"
      :key="componentItem.id"
      :component-item="componentItem"
      :item-index="itemIndex"
      :class="{ disabled }"
      @disable="disable"
      @enable="enable"
    >
      {{ disabled }}</ComponentItemsContainerListItem
    >
  </div>
</template>
<script>
import { computed, defineComponent, ref } from "vue";
import ComponentItemsContainerListItem from "@/components/canvas/sidebar/component-items/ComponentItemsContainerListItem.vue";
import store from "@/store";

export default defineComponent({
  name: "ComponentItemsContainer",
  components: { ComponentItemsContainerListItem },

  setup() {
    const componentItems = computed(() => {
      return store.getters["components/componentItems"];
    });
    const disabled = ref(false);

    const enable = () => {
      disabled.value = false;
    };

    const disable = () => {
      disabled.value = true;
    };

    return {
      disabled,
      enable,
      disable,
      componentItems,
    };
  },
});
</script>

<style scoped>
* {
  box-sizing: content-box;
}
</style>

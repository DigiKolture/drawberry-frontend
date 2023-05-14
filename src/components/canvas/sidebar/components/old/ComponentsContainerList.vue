<template>
  <ul class="components__list" id="components-list">
    <ComponentsContainerListItem
      v-for="component in components"
      :key="component.id"
      :component="component"
    />
  </ul>
</template>
<script>
import { computed, defineComponent } from "vue";
import ComponentsContainerListItem from "./ComponentsContainerListItem";
import store from "@/store";

export default defineComponent({
  name: "ComponentsContainerList",
  components: { ComponentsContainerListItem },

  setup() {
    const components = computed(() => {
      return store.getters["components/components"];
    });

    return {
      components,
    };
  },
});
</script>

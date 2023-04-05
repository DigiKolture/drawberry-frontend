<template>
  <div class="component__items__container hide" id="component-items">
    <ComponentItemsContainerList />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import ComponentItemsContainerList from "@/components/canvas/sidebar/component-items/ComponentItemsContainerList";

export default defineComponent({
  name: "ComponentItemsContainer",
  components: { ComponentItemsContainerList },
});
</script>

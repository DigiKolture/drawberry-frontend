<template>
  <div class="components__container">
    <h5 class="components__title">Components</h5>
    <ComponentsContainerList />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import ComponentsContainerList from "./ComponentsContainerList";

export default defineComponent({
  name: "ComponentsContainer",
  components: { ComponentsContainerList },
});
</script>

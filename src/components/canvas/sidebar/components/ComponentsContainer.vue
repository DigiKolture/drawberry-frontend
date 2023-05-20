<template>
  <div class="components__container">
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

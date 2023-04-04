<template>
  <BaseLayout>
    <div class="canvas__container"></div>
  </BaseLayout>
</template>
<script>
import { computed, defineComponent } from "vue";
import BaseLayout from "@/components/layout/BaseLayout";
import store from "@/store";

export default defineComponent({
  name: "CanvasPage",
  components: { BaseLayout },

  setup() {
    const project = computed(() => {
      return store.getters["projects/project"];
    });
    return {
      project,
    };
  },
});
</script>

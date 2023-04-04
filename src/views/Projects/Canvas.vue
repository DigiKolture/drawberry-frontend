<template>
  <CanvasLayout>
    <template v-slot:sidebar> </template>
    <template v-slot:workspace> </template>
  </CanvasLayout>
</template>
<script>
import { computed, defineComponent } from "vue";
import store from "@/store";
import CanvasLayout from "@/components/layout/CanvasLayout";

export default defineComponent({
  name: "CanvasPage",
  components: { CanvasLayout },

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

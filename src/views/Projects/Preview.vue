<template>
  <BaseLayout> </BaseLayout>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import BaseLayout from "@/components/layout/BaseLayout.vue";

export default defineComponent({
  name: "PreviewPage",
  components: { BaseLayout },
  setup() {
    onMounted(() => {
      store.dispatch("components/getComponents");
      store.dispatch("canvas/getGoogleFonts");
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);
    });

    const selectedComponent = ref({});

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    return {
      project,
      selectedComponent,
    };
  },
});
</script>

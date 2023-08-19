<template>
  <BaseLayout> </BaseLayout>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "PreviewPage",
  components: { BaseLayout },
  setup() {
    const route = useRoute();
    const projectId = route.params.id as string;

    onMounted(async () => {
      const project = await store.dispatch(
        "projects/getProjectComponentsForPreview",
        projectId
      );
      console.log({ project });
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

<template>
  <BaseLayout>
    <div class="preview__container" :style="styles">
      <div
        class="preview__component__items__container"
        :class="[currentPreview, style.layout]"
      >
        <div
          v-for="(componentItem, itemIndex) in workspaceComponents"
          :key="itemIndex"
          class="preview__component__items__list__item"
          v-html="componentItem.html"
        ></div>
      </div>
    </div>
  </BaseLayout>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
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

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const currentPreview = computed(() => {
      return store.getters["preview/currentPreview"];
    });

    const styles = computed(() => {
      return {
        backgroundColor: style.value.backgroundColor,
        backgroundImage: `url('${style.value.backgroundImage}')`,
        backgroundSize: "cover",
      };
    });

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    return {
      project,
      style,
      styles,
      currentPreview,
      workspaceComponents,
    };
  },
});
</script>

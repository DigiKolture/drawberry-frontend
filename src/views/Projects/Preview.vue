<template>
  <BaseLayout>
    <div class="preview__container" :style="styles">
      <!-- The read-only preview renders the Compiled email HTML (tables) — the same artifact
           export/download/test-email serve (ADR-0005) — so "what I see" is "what I send". It
           is rendered in a sandboxed iframe with no copy-HTML / view-source affordance. The
           mobile/desktop toggle only sizes the frame; the email's own @media does the rest. -->
      <iframe
        v-if="compiledHtml"
        class="preview__frame"
        :class="currentPreview"
        :srcdoc="compiledHtml"
        title="Email preview"
        sandbox=""
      ></iframe>
      <div v-else class="preview__empty">{{ emptyMessage }}</div>
    </div>
  </BaseLayout>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "PreviewPage",
  components: { BaseLayout },
  setup() {
    const route = useRoute();
    const projectId = route.params.id;
    const style = ref({});
    const compiledHtml = ref("");

    onMounted(async () => {
      store.commit("canvas/SET_NAVIGATED_FROM_PREVIEW", false);
      store.commit("projects/SET_PROJECT", null);
      const project = await store.dispatch(
        "projects/getProjectComponentsForPreview",
        projectId
      );

      store.commit("projects/SET_PROJECT", {
        name: project.name,
        id: project.id,
        user: project.user,
      });
      style.value = project.style || {};
      compiledHtml.value = project.compiledHtml || "";
    });

    const currentPreview = computed(() => {
      return store.getters["preview/currentPreview"];
    });

    const emptyMessage =
      "Preview will appear here once this design has been saved.";

    const styles = computed(() => {
      const styleObj = {
        backgroundColor: style.value.backgroundColor,
        backgroundSize: "cover",
      };

      if (style.value.backgroundImage) {
        styleObj.backgroundImage = `url('${style.value.backgroundImage}')`;
      }

      return styleObj;
    });

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    return {
      project,
      style,
      styles,
      currentPreview,
      compiledHtml,
      emptyMessage,
    };
  },
});
</script>

<style scoped>
.preview__container {
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 24px 0 100px;
  /* Let the fixed-width frame scroll rather than shrink when the pane is narrow, so the
     email keeps rendering at the chosen breakpoint. */
  overflow-x: auto;
}

/* Fixed widths so the preview reproduces the real render, not an in-between one: the email
   only shows its desktop layout at ~620px+, and its mobile layout below that. A fluid frame
   would render the email compressed in a narrow pane and diverge from the exported HTML. */
.preview__frame {
  border: 0;
  width: 700px;
  flex: 0 0 auto;
  height: calc(100vh - 140px);
  background: #ffffff;
  transition: width 0.2s ease;
}

.preview__frame.mobile {
  width: 375px;
}

.preview__empty {
  align-self: center;
  color: #6b6b6b;
  font-size: 14px;
  text-align: center;
  padding: 40px;
}
</style>

<template>
  <div class="projects__body__item__header" :style="styles">
    <div class="project__item__components__placeholder" v-html="html"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { projectHtml } from "@/composables/project/html";
export default defineComponent({
  name: "ProjectListItemPlaceholder",
  props: {
    project: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const { getHTML } = projectHtml();

    const html = computed(() => {
      return getHTML(props.project);
    });

    const styles = computed(() => {
      return {
        backgroundColor: props.project.style.backgroundColor,
        backgroundImage: `url('${props.project.style.backgroundImage}')`,
        backgroundSize: "cover",
      };
    });

    return { html, styles };
  },
});
</script>

<style></style>

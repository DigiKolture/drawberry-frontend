<template>
  <BaseLayout>
    <div class="preview__container" :style="styles">
      <div
        class="preview__component__items__container"
        style="margin-bottom: 100px"
        xd
        :class="[style.layout, currentPreview]"
      >
        <div
          v-for="(componentItem, itemIndex) in workspaceComponents"
          :key="itemIndex"
          class="preview__component__items__list__item"
          v-html="getHTML(componentItem)"
        ></div>
      </div>
    </div>
  </BaseLayout>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import store from "@/store";
import BaseLayout from "@/components/layout/BaseLayout.vue";
import { useRoute } from "vue-router";
import { updateDom } from "@/composables/canvas/update_dom";
import { fonts } from "@/composables/canvas/fonts";
import WebFont from "webfontloader";

export default defineComponent({
  name: "PreviewPage",
  components: { BaseLayout },
  setup() {
    const route = useRoute();
    const projectId = route.params.id as string;
    let style: any = ref({});
    let workspaceComponents = ref([]);
    const { updateComponentItemDom } = updateDom();
    const { extractUniqueFontFamilies } = fonts();

    onMounted(async () => {
      const project = await store.dispatch(
        "projects/getProjectComponentsForPreview",
        projectId
      );
      style.value = project.style;
      workspaceComponents.value = project.components;
    });

    const getHTML = (componentItem: any) => {
      return updateComponentItemDom(componentItem).html;
    };

    const fontFamilies = computed(() => {
      return extractUniqueFontFamilies(workspaceComponents.value);
    });

    watch(fontFamilies, () => {
      if (fontFamilies.value.length === 0) return;
      WebFont.load({
        google: {
          families: fontFamilies.value,
        },
      });
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
      getHTML,
    };
  },
});
</script>

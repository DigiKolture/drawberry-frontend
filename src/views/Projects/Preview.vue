<template>
  <BaseLayout>
    <div class="preview__container" :style="styles">
      <div
        class="preview__component__items__container"
        style="margin-bottom: 100px"
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
<script>
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
    const projectId = route.params.id;
    let style = ref({});
    let workspaceComponents = ref([]);
    const { updateComponentItemDom } = updateDom();
    const { extractUniqueFontFamilies } = fonts();

    onMounted(async () => {
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
      style.value = project.style;
      workspaceComponents.value = project.components;
    });

    const getHTML = (componentItem) => {
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
      let styleObj = {
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
      workspaceComponents,
      getHTML,
    };
  },
});
</script>

<template>
  <PanelStyle name="font" title="Font">
    <div class="font__style">
      <select class="canvas__select" v-model="family" id="">
        <option
          :key="key"
          v-for="(font, key) in googleFonts"
          :value="font.family"
        >
          {{ font.family }}
        </option>
      </select>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import store from "@/store";
import { fonts } from "@/composables/canvas/fonts";

export default defineComponent({
  name: "SidebarFontStyle",
  components: { PanelStyle },

  setup() {
    const name = "font-family";
    const googleFonts = computed(() => {
      return store.getters["canvas/googleFonts"];
    });

    const { extractFirstFontFamily, getFullFamily, getFont, getFontWeights } =
      fonts();

    const style = computed(() => {
      return store.getters["canvas/style"];
    });

    const family = ref(extractFirstFontFamily(style.value.fontFamily));
    const fullFamily = ref(style.value.fontFamily);

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    watch(family, (newVal) => {
      if (!newVal) return;
      fullFamily.value = getFullFamily(newVal);
      if (!fullFamily.value) return;
      const font = getFont(newVal);
      const weights = getFontWeights(font.variants);
      style.value.fontFamily = fullFamily.value;
      store.dispatch("canvas/updateProjectStyle", style.value).then();
      store.commit("canvas/UPDATE_ALL_PROJECT_COMPONENTS_STYLE", {
        "font-family": fullFamily.value,
        "font-weight": 400,
      });
      store.commit("canvas/SET_FONT_WEIGHTS", weights);
    });

    return { family, fullFamily, googleFonts };
  },
});
</script>

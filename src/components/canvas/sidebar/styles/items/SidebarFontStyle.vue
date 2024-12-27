<template>
  <PanelStyle :modifier="`general-${name}`" name="font" title="Font">
    <div class="font__style">
      <select class="canvas__select" v-model="localValue" id="">
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
import { generalStyleUpdater } from "@/composables/canvas/modifiers/general-style-updater";

export default defineComponent({
  name: "SidebarFontStyle",
  components: { PanelStyle },

  setup() {
    const name = "fontFamily";
    const { modifier } = generalStyleUpdater(name);

    const googleFonts = computed(() => {
      return store.getters["canvas/googleFonts"];
    });

    const { extractFirstFontFamily, getFullFamily, getFont, getFontWeights } =
      fonts();

    const localValue = ref(extractFirstFontFamily(modifier.value));

    watch(localValue, (newVal) => {
      if (!newVal) return;
      const fullFamily = getFullFamily(newVal);
      if (!fullFamily) return;
      modifier.value = fullFamily;
      const font = getFont(newVal);
      const weights = getFontWeights(font.variants);
      //Reset font weight after changing font family
      store.commit("canvas/UPDATE_ALL_PROJECT_COMPONENTS_STYLE", {
        "font-family": modifier.value,
        "font-weight": 400,
      });
      store.commit("canvas/SET_FONT_WEIGHTS", weights);
    });

    watch(modifier, (newVal) => {
      localValue.value = extractFirstFontFamily(newVal);
    });

    return { localValue, googleFonts, name };
  },
});
</script>

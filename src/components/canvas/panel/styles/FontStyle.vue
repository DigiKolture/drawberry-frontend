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
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import { fonts } from "@/composables/canvas/fonts";

export default defineComponent({
  name: "FontStyle",
  components: { PanelStyle },

  setup() {
    const name = "font-family";

    const { extractFirstFontFamily, getFullFamily, getFont, getFontWeights } =
      fonts();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const googleFonts = computed(() => {
      return store.getters["canvas/googleFonts"];
    });

    const family = ref(
      extractFirstFontFamily(focusedElement.value.attributes.style.value[name])
    );
    const fullFamily = ref(focusedElement.value.attributes.style.value[name]);

    watch(family, (newVal) => {
      if (!newVal) return;
      fullFamily.value = getFullFamily(newVal);
      const font = getFont(newVal);
      const weights = getFontWeights(font.variants);
      store.commit("canvas/SET_FONT_WEIGHTS", weights);
      focusedElement.value.attributes.style.value[name] = fullFamily.value;
      focusedElement.value.attributes.style.value["font-weight"] = 400;
      store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    });

    watch(focusedElement, (newVal) => {
      family.value = extractFirstFontFamily(
        newVal.attributes.style.value[name]
      );
      fullFamily.value = newVal.attributes.style.value[name];
    });

    return { googleFonts, family, fullFamily };
  },
});
</script>

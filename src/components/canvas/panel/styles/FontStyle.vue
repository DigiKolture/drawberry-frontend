<template>
  <PanelStyle :modifier="name" name="font" title="Font">
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
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import { fonts } from "@/composables/canvas/fonts";
import { modifiers } from "@/composables/canvas/panel/modifiers";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "FontStyle",
  components: { PanelStyle },
  props: {
    childId: {
      type: String,
      default: "",
      required: false,
    },
    childIndex: {
      type: Number,
      default: -1,
      required: false,
    },
  },

  setup(props) {
    const name = "font-family";

    const { modifier } = modifiersUpdater(props, name);
    const { updateStyle } = modifiers();
    const { extractFirstFontFamily, getFullFamily, getFont, getFontWeights } =
      fonts();

    // Flag to prevent circular updates during redo
    const isUpdatingFromModifier = ref(false);

    const googleFonts = computed(() => {
      return store.getters["canvas/googleFonts"];
    });

    // const localValue = ref(extractFirstFontFamily(modifier.value));
    const localValue = ref(extractFirstFontFamily(modifier.value));

    watch(localValue, (newVal, oldValue) => {
      if (!newVal || isUpdatingFromModifier.value) return;

      modifier.value = getFullFamily(newVal);
      const font = getFont(newVal);
      if (font) {
        const weights = getFontWeights(font.variants);
        store.commit("canvas/SET_FONT_WEIGHTS", weights);
      }
      //Reset font weight after changing font family
      updateStyle("font-weight", "400", props.childIndex);
    });

    watch(modifier, (newVal) => {
      // Set flag to prevent triggering localValue watcher
      isUpdatingFromModifier.value = true;
      localValue.value = extractFirstFontFamily(newVal);
      // Reset flag on next tick
      setTimeout(() => {
        isUpdatingFromModifier.value = false;
      }, 0);
    });

    return { name, googleFonts, localValue };
  },
});
</script>

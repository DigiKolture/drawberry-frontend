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
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import { fonts } from "@/composables/canvas/fonts";
import { modifiers } from "@/composables/canvas/panel/modifiers";

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

    const { focusedElement, getTargetElement, updateStyle } = modifiers();

    const { extractFirstFontFamily, getFullFamily, getFont, getFontWeights } =
      fonts();

    const googleFonts = computed(() => {
      return store.getters["canvas/googleFonts"];
    });

    const family = ref(
      extractFirstFontFamily(
        getTargetElement(props.childId, props.childIndex).attributes.style
          .value[name]
      )
    );
    const fullFamily = ref(
      getTargetElement(props.childId, props.childIndex).attributes.style.value[
        name
      ]
    );

    watch(family, (newVal) => {
      if (!newVal) return;
      fullFamily.value = getFullFamily(newVal);
      const font = getFont(newVal);
      const weights = getFontWeights(font.variants);
      store.commit("canvas/SET_FONT_WEIGHTS", weights);
      updateStyle(name, fullFamily.value, props.childIndex);
      //Reset font weight after changing font family
      updateStyle("font-weight", 400, props.childIndex);
      // focusedElement.value.attributes.style.value["font-weight"] = 400;
      // store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    });

    // watch(focusedElement, (newVal) => {
    //   family.value = extractFirstFontFamily(
    //     newVal.attributes.style.value[name]
    //   );
    //   fullFamily.value = newVal.attributes.style.value[name];
    // });

    return { googleFonts, family, fullFamily };
  },
});
</script>

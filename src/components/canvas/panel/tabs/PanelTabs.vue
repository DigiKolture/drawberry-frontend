<template>
  <div class="canvas__panel__tabs">
    <PanelTab title="Background">
      <div class="canvas__panel__styles">
        <FontStyle />
        <div class="canvas__panel__styles__row">
          <FontSizeStyle v-if="showStyle('font-size')" />
          <FontWeightStyle v-if="showStyle('font-weight')" />
          <LineHeightStyle />
          <LetterSpacingStyle />
        </div>
        <PaddingStyle v-if="showStyle('padding')" />
        <TextColorStyle v-if="showStyle('color')" />
        <BackgroundColorStyle v-if="showStyle('background-color')" />
        <TextAlignStyle v-if="showStyle('text-align')" />
        <HorizontalAlignStyle v-if="hasAttributes('align')" />
        <VerticalAlignStyle v-if="hasAttributes('valign')" />
        <ContentStyle v-if="hasContent()" />
        <HrefAttribute v-if="hasAttributes('href')" />
        <BorderRadiusStyle />
        <ShadowStyle />
      </div>
    </PanelTab>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import PanelTab from "./PanelTab.vue";

import BorderRadiusStyle from "@/components/canvas/panel/styles/BorderRadiusStyle.vue";
import ShadowStyle from "@/components/canvas/panel/styles/ShadowStyle.vue";
import BackgroundColorStyle from "@/components/canvas/panel/styles/BackgroundColorStyle.vue";
import TextColorStyle from "@/components/canvas/panel/styles/TextColorStyle.vue";
import ContentStyle from "@/components/canvas/panel/styles/ContentStyle.vue";
import FontStyle from "@/components/canvas/panel/styles/FontStyle.vue";
import FontSizeStyle from "@/components/canvas/panel/styles/FontSizeStyle.vue";
import FontWeightStyle from "@/components/canvas/panel/styles/FontWeightStyle.vue";
import LineHeightStyle from "@/components/canvas/panel/styles/LineHeightStyle.vue";
import LetterSpacingStyle from "@/components/canvas/panel/styles/LetterSpacingStyle.vue";
import HorizontalAlignStyle from "@/components/canvas/panel/styles/HorizontalAlignStyle.vue";
import store from "@/store";
import HrefAttribute from "@/components/canvas/panel/styles/HrefAttribute.vue";
import PaddingStyle from "@/components/canvas/panel/styles/PaddingStyle.vue";
import VerticalAlignStyle from "@/components/canvas/panel/styles/VerticalAlignStyle.vue";
import TextAlignStyle from "@/components/canvas/panel/styles/TextAlignStyle.vue";

export default defineComponent({
  name: "PanelTabs",
  components: {
    TextAlignStyle,
    VerticalAlignStyle,
    PaddingStyle,
    HrefAttribute,
    HorizontalAlignStyle,
    LetterSpacingStyle,
    LineHeightStyle,
    FontWeightStyle,
    FontSizeStyle,
    FontStyle,
    ContentStyle,
    TextColorStyle,
    BackgroundColorStyle,
    ShadowStyle,
    BorderRadiusStyle,
    PanelTab,
  },
  setup() {
    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const styles = computed(() => {
      return Object.keys(focusedElement.value.attributes?.style?.value || []);
    });

    const attributes = computed(() => {
      return Object.keys(focusedElement.value.attributes);
    });

    const showStyle = (style: string) => {
      return style ? styles.value.includes(style) : true;
    };

    const hasAttributes = (attribute: string) => {
      return attribute ? attributes.value.includes(attribute) : true;
    };

    const hasContent = () => {
      return focusedElement.value.innerHtml !== null;
    };

    return {
      styles,
      showStyle,
      hasContent,
      hasAttributes,
    };
  },
});
</script>

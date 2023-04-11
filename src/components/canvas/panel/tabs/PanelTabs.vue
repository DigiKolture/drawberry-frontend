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
        <TextColorStyle v-if="showStyle('color')" />
        <BackgroundColorStyle />
        <HorizontalAlignStyle v-if="showStyle('text-align')" />
        <VerticalAlignStyle v-if="hasAttributes('valign')" />
        <ContentStyle v-if="hasContent()" />
        <HrefAttribute v-if="hasAttributes('href')" />
        <BorderRadiusStyle />
        <SpacingStyle />
        <ShadowStyle />
      </div>
    </PanelTab>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import PanelTab from "./PanelTab";
import SpacingStyle from "@/components/canvas/panel/styles/SpacingStyle";
import BorderRadiusStyle from "@/components/canvas/panel/styles/BorderRadiusStyle";
import ShadowStyle from "@/components/canvas/panel/styles/ShadowStyle";
import BackgroundColorStyle from "@/components/canvas/panel/styles/BackgroundColorStyle";
import TextColorStyle from "@/components/canvas/panel/styles/TextColorStyle";
import ContentStyle from "@/components/canvas/panel/styles/ContentStyle";
import FontStyle from "@/components/canvas/panel/styles/FontStyle";
import FontSizeStyle from "@/components/canvas/panel/styles/FontSizeStyle";
import FontWeightStyle from "@/components/canvas/panel/styles/FontWeightStyle";
import LineHeightStyle from "@/components/canvas/panel/styles/LineHeightStyle";
import LetterSpacingStyle from "@/components/canvas/panel/styles/LetterSpacingStyle";
import HorizontalAlignStyle from "@/components/canvas/panel/styles/HorizontalAlignStyle";
import VerticalAlignStyle from "@/components/canvas/panel/styles/VerticalAlignStyle";
import store from "@/store";
import HrefAttribute from "@/components/canvas/panel/styles/HrefAttribute.vue";

export default defineComponent({
  name: "PanelTabs",
  components: {
    HrefAttribute,
    HorizontalAlignStyle,
    LetterSpacingStyle,
    LineHeightStyle,
    VerticalAlignStyle,
    FontWeightStyle,
    FontSizeStyle,
    FontStyle,
    ContentStyle,
    TextColorStyle,
    BackgroundColorStyle,
    ShadowStyle,
    BorderRadiusStyle,
    SpacingStyle,
    PanelTab,
  },
  setup() {
    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const styles = computed(() => {
      return Object.keys(focusedElement.value.attributes.style.value);
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

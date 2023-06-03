<template>
  <section class="canvas__panel__grouped__styles">
    <div class="canvas__panel__tabs">
      <PanelTab title="Layout">
        <HorizontalAlignStyle v-if="hasAttributes('align')" />
        <VerticalAlignStyle v-if="hasAttributes('valign')" />
      </PanelTab>
      <PanelTab title="Spacing">
        <PaddingStyle v-if="showStyle('padding')" />
      </PanelTab>

      <PanelTab title="Typography">
        <FontStyle />
        <TextColorStyle v-if="showStyle('color')" />
        <div class="canvas__panel__styles__row">
          <FontSizeStyle v-if="showStyle('font-size')" />
          <FontWeightStyle v-if="showStyle('font-weight')" />
          <LineHeightStyle v-if="showStyle('line-height')" />
          <LetterSpacingStyle v-if="showStyle('letter-spacing')" />
        </div>
        <TextAlignStyle v-if="showStyle('text-align')" />
        <ContentStyle v-if="hasContent()" />
      </PanelTab>
      <PanelTab title="Background">
        <BackgroundColorStyle v-if="showStyle('background-color')" />
      </PanelTab>
      <PanelTab title="Borders">
        <BackgroundColorStyle v-if="showStyle('background-color')" />
      </PanelTab>
      <PanelTab title="Effects">
        <ShadowStyle v-if="showStyle('box-shadow')" />
      </PanelTab>
      <PanelTab title="Link">
        <HrefAttribute v-if="hasAttributes('href')" />
      </PanelTab>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import PanelTab from "@/components/canvas/panel/tabs/PanelTab.vue";
import HorizontalAlignStyle from "@/components/canvas/panel/styles/HorizontalAlignStyle.vue";
import VerticalAlignStyle from "@/components/canvas/panel/styles/VerticalAlignStyle.vue";
import PaddingStyle from "@/components/canvas/panel/styles/PaddingStyle.vue";
import FontSizeStyle from "@/components/canvas/panel/styles/FontSizeStyle.vue";
import FontWeightStyle from "@/components/canvas/panel/styles/FontWeightStyle.vue";
import LineHeightStyle from "@/components/canvas/panel/styles/LineHeightStyle.vue";
import LetterSpacingStyle from "@/components/canvas/panel/styles/LetterSpacingStyle.vue";
import FontStyle from "@/components/canvas/panel/styles/FontStyle.vue";
import TextAlignStyle from "@/components/canvas/panel/styles/TextAlignStyle.vue";
import ContentStyle from "@/components/canvas/panel/styles/ContentStyle.vue";
import BackgroundColorStyle from "@/components/canvas/panel/styles/BackgroundColorStyle.vue";
import HrefAttribute from "@/components/canvas/panel/styles/HrefAttribute.vue";
import ShadowStyle from "@/components/canvas/panel/styles/ShadowStyle.vue";
import TextColorStyle from "@/components/canvas/panel/styles/TextColorStyle.vue";

export default defineComponent({
  name: "CanvasPanelGroupedStyles",
  components: {
    TextColorStyle,
    ShadowStyle,
    HrefAttribute,
    BackgroundColorStyle,
    ContentStyle,
    TextAlignStyle,
    FontStyle,
    LetterSpacingStyle,
    LineHeightStyle,
    FontWeightStyle,
    FontSizeStyle,
    PaddingStyle,
    VerticalAlignStyle,
    HorizontalAlignStyle,
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
      focusedElement,
      hasAttributes,
    };
  },
});
</script>

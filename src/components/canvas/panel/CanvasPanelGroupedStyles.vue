<template>
  <section class="canvas__panel__grouped__styles">
    <div class="canvas__panel__tabs">
      <PanelTab
        v-if="showTab(tabsStyles.layout)"
        @update="setActiveTab"
        :properties="tabsStyles.layout"
        :show-body="activeTab === tabsStyles.layout.index"
      >
        <HorizontalAlignStyle v-if="hasAttributes('align')" />
        <VerticalAlignStyle v-if="hasAttributes('valign')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.spacing)"
        @update="setActiveTab"
        :properties="tabsStyles.spacing"
        :show-body="activeTab === tabsStyles.spacing.index"
      >
        <PaddingStyle v-if="showStyle('padding')" />
      </PanelTab>

      <PanelTab
        v-if="showTab(tabsStyles.typography)"
        @update="setActiveTab"
        :properties="tabsStyles.typography"
        :show-body="activeTab === tabsStyles.typography.index"
      >
        <FontStyle v-if="showStyle('font-family')" />
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
      <PanelTab
        v-if="showTab(tabsStyles.background)"
        @update="setActiveTab"
        :properties="tabsStyles.background"
        :show-body="activeTab === tabsStyles.background.index"
      >
        <BackgroundColorStyle v-if="showStyle('background-color')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.borders)"
        @update="setActiveTab"
        :properties="tabsStyles.borders"
        :show-body="activeTab === tabsStyles.borders.index"
      >
        <BorderRadiusStyle v-if="showStyle('border-radius')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.effects)"
        @update="setActiveTab"
        :properties="tabsStyles.effects"
        :show-body="activeTab === tabsStyles.effects.index"
      >
        <ShadowStyle v-if="showStyle('box-shadow')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.link)"
        @update="setActiveTab"
        :properties="tabsStyles.link"
        :show-body="activeTab === tabsStyles.link.index"
      >
        <HrefAttribute v-if="hasAttributes('href')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.media)"
        @update="setActiveTab"
        :properties="tabsStyles.media"
        :show-body="activeTab === tabsStyles.media.index"
      >
        <ImageAttribute v-if="hasAttributes('src')" />
      </PanelTab>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from "vue";
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
import BorderRadiusStyle from "@/components/canvas/panel/styles/BorderRadiusStyle.vue";
import ImageAttribute from "@/components/canvas/panel/styles/ImageAttribute.vue";

export default defineComponent({
  name: "CanvasPanelGroupedStyles",
  components: {
    ImageAttribute,
    BorderRadiusStyle,
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

    const activeTab = ref(-1);

    const tabsStyles = {
      layout: {
        title: "Layout",
        index: 0,
        styles: [],
        attributes: ["align", "valign"],
      },
      spacing: {
        title: "Spacing",
        index: 1,
        styles: ["padding"],
        attributes: [],
      },
      typography: {
        title: "Typography",
        index: 2,
        styles: [
          "color",
          "font-size",
          "font-weight",
          "line-height",
          "letter-spacing",
          "text-align",
          "font-family",
        ],
        attributes: [],
        isContent: true,
      },
      background: {
        title: "Background",
        index: 3,
        styles: ["background-color"],
        attributes: [],
      },
      borders: {
        title: "Borders",
        index: 4,
        styles: ["border-radius"],
        attributes: [],
      },
      effects: {
        title: "Effects",
        index: 5,
        styles: ["box-shadow"],
        attributes: [],
      },
      link: {
        title: "Link",
        index: 6,
        styles: [],
        attributes: ["href"],
      },
      media: {
        title: "Media",
        index: 7,
        styles: [],
        attributes: ["src"],
      },
    };

    const showTab = (tab: any) => {
      for (let style of tab.styles) {
        const hasStyle = showStyle(style);
        if (hasStyle) return true;
      }
      for (let attr of tab.attributes) {
        const hasAttr = hasAttributes(attr);
        if (hasAttr) return true;
      }
      // return tab.isContent;
      return tab.isContent && hasContent();
    };

    const hasAttributes = (attribute: string) => {
      return attribute ? attributes.value.includes(attribute) : true;
    };

    const hasContent = () => {
      return focusedElement.value.innerHtml !== null;
    };

    const setActiveTab = (index: number) => {
      if (index == activeTab.value) {
        return (activeTab.value = -1);
      }
      return (activeTab.value = index);
    };

    return {
      styles,
      showStyle,
      hasContent,
      setActiveTab,
      showTab,
      focusedElement,
      hasAttributes,
      tabsStyles,
      activeTab,
    };
  },
});
</script>

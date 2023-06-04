<template>
  <section class="canvas__panel__grouped__styles">
    <div class="canvas__panel__tabs">
      <PanelTab
        v-if="showTab(tabsStyles.layout)"
        @click="setActiveTab(tabsStyles.layout.index)"
        title="Layout"
        :show-body="activeTab === tabsStyles.layout.index"
      >
        <HorizontalAlignStyle v-if="hasAttributes('align')" />
        <VerticalAlignStyle v-if="hasAttributes('valign')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.spacing)"
        @click="setActiveTab(tabsStyles.spacing.index)"
        title="Spacing"
        :show-body="activeTab === tabsStyles.spacing.index"
      >
        <PaddingStyle v-if="showStyle('padding')" />
      </PanelTab>

      <PanelTab
        v-if="showTab(tabsStyles.typography)"
        @click="setActiveTab(tabsStyles.typography.index)"
        title="Typography"
        :show-body="activeTab === tabsStyles.typography.index"
      >
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
      <PanelTab
        v-if="showTab(tabsStyles.background)"
        @click="setActiveTab(tabsStyles.background.index)"
        title="Background"
        :show-body="activeTab === tabsStyles.background.index"
      >
        <BackgroundColorStyle v-if="showStyle('background-color')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.borders)"
        @click="setActiveTab(tabsStyles.effects.borders)"
        title="Borders"
        :show-body="activeTab === tabsStyles.borders.index"
      >
        <BorderRadiusStyle v-if="showStyle('border-radius')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.effects)"
        @click="setActiveTab(tabsStyles.effects.index)"
        title="Effects"
        :show-body="activeTab === tabsStyles.effects.index"
      >
        <ShadowStyle v-if="showStyle('box-shadow')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.link)"
        @click="setActiveTab(tabsStyles.link.index)"
        title="Link"
        :show-body="activeTab === tabsStyles.link.index"
      >
        <HrefAttribute v-if="hasAttributes('href')" />
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

export default defineComponent({
  name: "CanvasPanelGroupedStyles",
  components: {
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
        index: 0,
        styles: [],
        attributes: ["align", "valign"],
      },
      spacing: {
        index: 1,
        styles: ["padding"],
        attributes: [],
      },
      typography: {
        index: 2,
        styles: [
          "color",
          "font-size",
          "font-weight",
          "line-height",
          "letter-spacing",
          "text-align",
        ],
        attributes: [],
        isContent: true,
      },
      background: {
        index: 3,
        styles: ["background-color"],
        attributes: [],
      },
      borders: {
        index: 4,
        styles: ["border-radius"],
        attributes: [],
      },
      effects: {
        index: 5,
        styles: ["box-shadow"],
        attributes: [],
      },
      link: {
        index: 6,
        styles: [],
        attributes: ["href"],
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
      return tab.isContent;
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

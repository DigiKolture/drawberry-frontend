<template>
  <section class="canvas__panel__grouped__styles">
    <div class="canvas__panel__tabs">
      <PanelTab
        v-if="showTab(tabsStyles.layout)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.layout"
        :show-body="tabStates[tabsStyles.layout.index]"
      >
        <HorizontalAlignStyle
          v-if="hasAttributes('align')"
          :is-parent="isParentAttribute('align')"
        />
        <VerticalAlignStyle
          v-if="hasAttributes('valign')"
          :is-parent="isParentAttribute('valign')"
        />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.spacing)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.spacing"
        :show-body="tabStates[tabsStyles.spacing.index]"
      >
        <PaddingStyle
          :is-parent="isParentStyle('padding')"
          v-if="showStyle('padding')"
        />
      </PanelTab>

      <PanelTab
        v-if="showTab(tabsStyles.typography)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.typography"
        :show-body="tabStates[tabsStyles.typography.index]"
      >
        <FontStyle v-if="showStyle('font-family')" />
        <TextColorStyle v-if="showStyle('color')" />
        <div class="canvas__panel__styles__row" v-if="showTypographyRow">
          <FontSizeStyle v-if="showStyle('font-size')" />
          <FontWeightStyle v-if="showStyle('font-weight')" />
          <LineHeightStyle v-if="showStyle('line-height')" />
          <LetterSpacingStyle v-if="showStyle('letter-spacing')" />
        </div>
        <TextAlignStyle
          v-if="showStyle('text-align')"
          :is-parent="isParentStyle('padding')"
        />
        <ContentStyle v-if="hasContent()" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.background)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.background"
        :show-body="tabStates[tabsStyles.background.index]"
      >
        <BackgroundColorStyle v-if="showStyle('background-color')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.borders)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.borders"
        :show-body="tabStates[tabsStyles.borders.index]"
      >
        <BorderRadiusStyle v-if="showStyle('border-radius')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.effects)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.effects"
        :show-body="tabStates[tabsStyles.effects.index]"
      >
        <ShadowStyle v-if="showStyle('box-shadow')" />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.link)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.link"
        :show-body="tabStates[tabsStyles.link.index]"
      >
        <HrefAttribute
          :is-parent="isParentAttribute('href')"
          v-if="hasAttributes('href')"
        />
      </PanelTab>
      <PanelTab
        v-if="showTab(tabsStyles.media)"
        @update="setActiveTab"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.media"
        :show-body="tabStates[tabsStyles.media.index]"
      >
        <ImageAttribute v-if="hasAttributes('src')" />
      </PanelTab>
    </div>
  </section>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from "vue";
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
import { panel } from "@/composables/canvas/panel";

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
    const {
      showTab,
      hasAttributes,
      hasContent,
      tabsStyles,
      showStyle,
      isParentAttribute,
      isParentStyle,
    } = panel();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const styles = computed(() => {
      return Object.keys(focusedElement.value.attributes?.style?.value || []);
    });

    const tabStates = computed(() => {
      return store.getters["panel/tabStates"];
    });

    const showTypographyRow = computed(() => {
      return (
        showStyle("font-size") ||
        showStyle("font-weight") ||
        showStyle("line-height") ||
        showStyle("letter-spacing")
      );
    });

    const setActiveTab = (index: number) => {
      store.commit("panel/TOGGLE_TAB_STATE", index.toString());
    };

    const closeAllTabs = () => {
      store.commit("panel/CLOSE_ALL_TAB_STATES");
    };

    return {
      styles,
      showStyle,
      isParentAttribute,
      isParentStyle,
      hasContent,
      setActiveTab,
      showTab,
      focusedElement,
      hasAttributes,
      tabsStyles,
      tabStates,
      closeAllTabs,
      showTypographyRow,
    };
  },
});
</script>

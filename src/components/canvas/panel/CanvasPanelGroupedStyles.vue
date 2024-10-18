<template>
  <section class="canvas__panel__grouped__styles">
    <div class="canvas__panel__tabs">
      <PanelTab
        :index="tabsStyles.layout.index"
        v-if="showTab(tabsStyles.layout)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.layout"
        :show-body="tabStates[tabsStyles.layout.index]"
      >
        <HorizontalAlignStyle v-if="hasAttributes('align')" />
        <template v-for="(child, idx) in focusedElement.children">
          <HorizontalAlignStyle
            v-if="childHasAttribute(idx as number, 'align')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
        <VerticalAlignStyle v-if="hasAttributes('valign')" />
        <template v-for="(child, idx) in focusedElement.children">
          <VerticalAlignStyle
            v-if="childHasAttribute(idx as number, 'valign')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
      </PanelTab>
      <PanelTab
        :index="tabsStyles.spacing.index"
        v-if="showTab(tabsStyles.spacing)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.spacing"
        :show-body="tabStates[tabsStyles.spacing.index]"
      >
        <PaddingStyle v-if="showStyle('padding')" />
        <template v-for="(child, idx) in focusedElement.children">
          <PaddingStyle
            v-if="childHasStyle(idx as number, 'padding')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
        <MarginTopStyle v-if="showStyle('margin-top')" />
        <template v-for="(child, idx) in focusedElement.children">
          <MarginTopStyle
            v-if="childHasStyle(idx as number, 'margin-top')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
        <MarginBottomStyle v-if="showStyle('margin-bottom')" />
        <template v-for="(child, idx) in focusedElement.children">
          <MarginBottomStyle
            v-if="childHasStyle(idx as number, 'margin-bottom')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
      </PanelTab>

      <PanelTab
        :index="tabsStyles.typography.index"
        v-if="showTab(tabsStyles.typography)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.typography"
        :show-body="tabStates[tabsStyles.typography.index]"
      >
        <FontStyle v-if="showStyle('font-family')" />
        <template v-for="(child, idx) in focusedElement.children">
          <FontStyle
            v-if="childHasStyle(idx as number, 'font-family')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
        <TextColorStyle v-if="showStyle('color')" />
        <template v-for="(child, idx) in focusedElement.children">
          <TextColorStyle
            v-if="childHasStyle(idx as number, 'color')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
        <div
          class="canvas__panel__styles__row"
          style="margin-bottom: 350px"
          v-if="showTypographyRow"
        >
          <FontSizeStyle v-if="showStyle('font-size')" />
          <template v-for="(child, idx) in focusedElement.children">
            <FontSizeStyle
              v-if="childHasStyle(idx as number, 'font-size')"
              :key="child"
              :child-id="child"
              :child-index="idx"
            />
          </template>
          <FontWeightStyle v-if="showStyle('font-weight')" />
          <template v-for="(child, idx) in focusedElement.children">
            <FontWeightStyle
              v-if="childHasStyle(idx as number, 'font-weight')"
              :key="child"
              :child-id="child"
              :child-index="idx"
            />
          </template>
          <LineHeightStyle v-if="showStyle('line-height')" />
          <template v-for="(child, idx) in focusedElement.children">
            <LineHeightStyle
              v-if="childHasStyle(idx as number, 'line-height')"
              :key="child"
              :child-id="child"
              :child-index="idx"
            />
          </template>
          <LetterSpacingStyle v-if="showStyle('letter-spacing')" />
          <template v-for="(child, idx) in focusedElement.children">
            <LetterSpacingStyle
              v-if="childHasStyle(idx as number, 'letter-spacing')"
              :key="child"
              :child-id="child"
              :child-index="idx"
            />
          </template>
        </div>
        <TextAlignStyle v-if="showStyle('text-align')" />
        <template v-for="(child, idx) in focusedElement.children">
          <TextAlignStyle
            v-if="childHasStyle(idx as number, 'text-align')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
        <ContentStyle v-if="hasContent()" />
        <template v-for="(child, idx) in focusedElement.children">
          <ContentStyle
            v-if="childHasContent(idx as number)"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
      </PanelTab>
      <PanelTab
        :index="tabsStyles.background.index"
        v-if="showTab(tabsStyles.background)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.background"
        :show-body="tabStates[tabsStyles.background.index]"
      >
        <BackgroundImageAttribute v-if="hasAttributes('background')" />
        <template v-for="(child, idx) in focusedElement.children">
          <BackgroundImageAttribute
            v-if="childHasAttribute(idx as number, 'background')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
        <BackgroundColorStyle v-if="showStyle('background-color')" />
        <template v-for="(child, idx) in focusedElement.children">
          <BackgroundColorStyle
            v-if="childHasStyle(idx as number, 'background-color')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
      </PanelTab>
      <PanelTab
        :index="tabsStyles.borders.index"
        v-if="showTab(tabsStyles.borders)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.borders"
        :show-body="tabStates[tabsStyles.borders.index]"
      >
        <BorderRadiusStyle v-if="showStyle('border-radius')" />
        <template v-for="(child, idx) in focusedElement.children">
          <BorderRadiusStyle
            v-if="childHasStyle(idx as number, 'border-radius')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
      </PanelTab>
      <PanelTab
        :index="tabsStyles.effects.index"
        v-if="showTab(tabsStyles.effects)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.effects"
        :show-body="tabStates[tabsStyles.effects.index]"
      >
        <ShadowStyle v-if="showStyle('box-shadow')" />
        <template v-for="(child, idx) in focusedElement.children">
          <ShadowStyle
            v-if="childHasStyle(idx as number, 'box-shadow')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
      </PanelTab>
      <PanelTab
        :index="tabsStyles.link.index"
        v-if="showTab(tabsStyles.link)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.link"
        :show-body="tabStates[tabsStyles.link.index]"
      >
        <HrefAttribute v-if="hasAttributes('href')" />
        <template v-for="(child, idx) in focusedElement.children">
          <HrefAttribute
            v-if="childHasAttribute(idx as number, 'href')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
      </PanelTab>
      <PanelTab
        :index="tabsStyles.media.index"
        v-if="showTab(tabsStyles.media)"
        @update="toggleTabContents"
        @close_tabs="closeAllTabs"
        :properties="tabsStyles.media"
        :show-body="tabStates[tabsStyles.media.index]"
      >
        <ImageAttribute v-if="hasAttributes('src')" />
        <template v-for="(child, idx) in focusedElement.children">
          <ImageAttribute
            v-if="childHasAttribute(idx as number, 'src')"
            :key="child"
            :child-id="child"
            :child-index="idx"
          />
        </template>
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
import BorderRadiusStyle from "@/components/canvas/panel/styles/BorderRadiusStyle.vue";
import ImageAttribute from "@/components/canvas/panel/styles/ImageAttribute.vue";
import { panel } from "@/composables/canvas/panel";
import MarginTopStyle from "@/components/canvas/panel/styles/spacing/MarginTopStyle.vue";
import MarginBottomStyle from "@/components/canvas/panel/styles/spacing/MarginBottomStyle.vue";
import BackgroundImageAttribute from "@/components/canvas/panel/styles/attributes/BackgroundImageAttribute.vue";

export default defineComponent({
  name: "CanvasPanelGroupedStyles",
  components: {
    BackgroundImageAttribute,
    MarginBottomStyle,
    MarginTopStyle,
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
      hasCurrentOrChildrenStyles,
      childHasStyle,
      childHasContent,
      childHasAttribute,
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
        hasCurrentOrChildrenStyles("font-size") ||
        hasCurrentOrChildrenStyles("font-weight") ||
        hasCurrentOrChildrenStyles("line-height") ||
        hasCurrentOrChildrenStyles("letter-spacing")
      );
    });

    const toggleTabContents = (index: number) => {
      store.commit("panel/TOGGLE_TAB_STATE", index.toString());
    };

    const closeAllTabs = () => {
      store.commit("panel/CLOSE_ALL_TAB_STATES");
    };

    return {
      styles,
      showStyle,
      childHasStyle,
      childHasAttribute,
      hasContent,
      toggleTabContents,
      showTab,
      focusedElement,
      hasAttributes,
      tabsStyles,
      childHasContent,
      tabStates,
      closeAllTabs,
      showTypographyRow,
    };
  },
});
</script>

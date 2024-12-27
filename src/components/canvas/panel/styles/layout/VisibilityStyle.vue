<template>
  <PanelStyle :modifier="name" title="Display">
    <div class="base__icons__style">
      <BaseButtonIcon
        :key="key"
        v-for="(option, key) in alignOptions"
        :class="{ active: option.align === modifier, [modifier]: true }"
        :icon="option.icon"
        @click="changeVisibility(option.align)"
      />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, watch } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";
import { HistoryActionTypes } from "@/store/modules/history/types";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import store from "@/store";

export default defineComponent({
  name: "VisibilityStyle",
  components: { PanelStyle, BaseButtonIcon },
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
    const name = "visibility";
    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_CONTENT
    );

    const focusedChildrenElements = computed(() => {
      return store.getters["canvas/focusedChildrenElements"];
    });

    const alignOptions = [
      {
        icon: "canvas/panel/styles/visibility/show",
        align: "show",
      },
      {
        icon: "canvas/panel/styles/visibility/none",
        align: "none",
      },
      {
        icon: "canvas/panel/styles/visibility/ghost",
        align: "ghost",
      },
    ];

    watch(modifier, (newVal) => {
      for (const child of focusedChildrenElements.value) {
        child[name] = newVal;
      }
    });

    const changeVisibility = (option: string) => {
      modifier.value = option;
    };

    return {
      name,
      alignOptions,
      modifier,
      changeVisibility,
    };
  },
});
</script>

<template>
  <PanelStyle :modifier="name" title="IMAGE LINK">
    <div class="content__style">
      <BaseImageTextUpload v-model="modifier" @confirm="updateImage" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseImageTextUpload from "@/components/canvas/panel/BaseImageTextUpload.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";
import { HistoryActionTypes } from "@/store/modules/history/types";

export default defineComponent({
  name: "ImageAttribute",
  components: {
    BaseImageTextUpload,
    PanelStyle,
  },
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
    const name = "src";

    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_ATTRIBUTE
    );

    let activeIndex = ref(0);
    const isInputFocused = ref(false);

    const updateImage = async () => {
      // if (!modifier.value) return;
      isInputFocused.value = false;
    };

    return {
      name,
      activeIndex,
      modifier,
      updateImage,
      isInputFocused,
    };
  },
});
</script>

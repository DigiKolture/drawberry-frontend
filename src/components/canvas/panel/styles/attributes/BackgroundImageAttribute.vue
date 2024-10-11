<template>
  <PanelStyle title="Background Image">
    <div class="content__style">
      <BaseImageTextUpload v-model="localValue" @confirm="updateImage" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import BaseImageTextUpload from "@/components/canvas/panel/BaseImageTextUpload.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";
import { HistoryActionTypes } from "@/store/modules/history/types";
export default defineComponent({
  name: "BackgroundImageAttribute",
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
    const name = "background";

    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_ATTRIBUTE
    );

    let activeIndex = ref(0);
    const isInputFocused = ref(false);

    const localValue = ref(modifier.value);

    const updateImage = async () => {
      if (!localValue.value) return;
      modifier.value = localValue.value;
      isInputFocused.value = false;
    };

    watch(modifier, (newVal) => {
      localValue.value = newVal;
    });

    return {
      activeIndex,
      localValue,
      updateImage,
      isInputFocused,
    };
  },
});
</script>

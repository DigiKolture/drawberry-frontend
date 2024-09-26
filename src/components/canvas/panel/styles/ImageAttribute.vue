<template>
  <PanelStyle title="IMAGE LINK">
    <div class="content__style">
      <BaseImageTextUpload v-model="src" @confirm="updateImage" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import store from "@/store";
import BaseImageTextUpload from "@/components/canvas/panel/BaseImageTextUpload.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";
//TODO Split Image Components
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

    const { getTargetElement, updateAttribute } = modifiers();

    let activeIndex = ref(0);
    const isInputFocused = ref(false);

    const src = ref(
      getTargetElement(props.childId, props.childIndex).attributes[name].value
    );

    const updateImage = async () => {
      if (!src.value) return;
      await updateAttribute(name, src.value, props.childIndex);
      isInputFocused.value = false;
    };

    // watch(focusedElement, (newVal) => {
    //   src.value = newVal.attributes[name].value;
    // });

    return {
      activeIndex,
      src,
      updateImage,
      isInputFocused,
    };
  },
});
</script>

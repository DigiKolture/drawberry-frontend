<template>
  <PanelStyle title="Background Image">
    <div class="content__style">
      <BaseImageTextUpload v-model="src" @confirm="updateImage" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import BaseImageTextUpload from "@/components/canvas/panel/BaseImageTextUpload.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";
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

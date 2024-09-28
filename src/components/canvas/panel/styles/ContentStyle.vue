<template>
  <PanelStyle title="Content">
    <div class="content__style">
      <textarea v-model="content" class="canvas__textarea"> </textarea>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";

export default defineComponent({
  name: "ContentStyle",
  components: { PanelStyle },
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
    const name = "innerHtml";

    const { getTargetElement, updateContent } = modifiers();

    const content = ref(
      getTargetElement(props.childId, props.childIndex)[name]
    );

    watch(content, (newVal: string) => {
      if (newVal) {
        updateContent(name, newVal, props.childIndex);
      }
    });

    // watch(focusedElement, (newVal) => {
    //   content.value = newVal[name];
    // });

    return {
      content,
    };
  },
});
</script>

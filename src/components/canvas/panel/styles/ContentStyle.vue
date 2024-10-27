<template>
  <PanelStyle :modifier="name" title="Content">
    <div class="content__style">
      <textarea v-model="localValue" class="canvas__textarea"> </textarea>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";
import { HistoryActionTypes } from "@/store/modules/history/types";
import { helpers } from "@/composables/helpers";

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
    const name = "textContent";

    const { nlToBr, brToNl } = helpers();

    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_CONTENT
    );

    console.log("<<<<<<<<<<<<< >>>>>>>>>>>");

    const localValue = ref(brToNl(modifier.value));

    console.log("localValue", localValue.value);

    watch(localValue, (newVal: string) => {
      if (!newVal) return;
      modifier.value = nlToBr(newVal);
    });

    watch(modifier, (newVal) => {
      localValue.value = brToNl(newVal);
    });

    return {
      name,
      localValue,
    };
  },
});
</script>

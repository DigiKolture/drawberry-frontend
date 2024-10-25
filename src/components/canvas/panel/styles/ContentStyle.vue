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
    const name = "textContent"; //textContent

    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_CONTENT
    );

    const localValue = ref(modifier.value);

    watch(localValue, (newVal: string) => {
      if (!newVal) return;
      modifier.value = newVal;
    });

    watch(modifier, (newVal) => {
      localValue.value = newVal;
    });

    return {
      name,
      localValue,
    };
  },
});
</script>

<template>
  <PanelStyle :modifier="name" title="INSERT LINK">
    <div class="content__style">
      <textarea v-model="modifier" class="canvas__textarea"> </textarea>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";
import { HistoryActionTypes } from "@/store/modules/history/types";

export default defineComponent({
  name: "HrefAttribute",
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
    const name = "href";
    const { modifier } = modifiersUpdater(
      props,
      name,
      HistoryActionTypes.COMPONENT_ATTRIBUTE
    );

    return {
      name,
      modifier,
    };
  },
});
</script>

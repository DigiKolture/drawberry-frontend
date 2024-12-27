<template>
  <PanelStyle :modifier="name" title="Letter spacing">
    <div class="font__size__style">
      <input v-model="localValue" class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "LetterSpacingStyle",
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
    const name = "letter-spacing";
    const unit = "px";
    const { modifier } = modifiersUpdater(props, name);

    const localValue = ref(modifier.value?.slice(0, -2));

    watch(localValue, (newVal) => {
      modifier.value = `${newVal}${unit}`;
    });

    watch(modifier, (newVal) => {
      localValue.value = newVal?.slice(0, -2);
    });

    return {
      localValue,
      name,
    };
  },
});
</script>

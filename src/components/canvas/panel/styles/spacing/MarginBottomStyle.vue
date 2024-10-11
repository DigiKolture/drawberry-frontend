<template>
  <PanelStyle :name="name">
    <div class="number__row__style__container">
      <div class="panel__style__head">
        <h5>Margin bottom</h5>
      </div>
      <div class="number__row__style">
        <input v-model="localStyleValue" />
        <span>PX</span>
      </div>
    </div>
  </PanelStyle>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import { helpers } from "@/composables/helpers";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "MarginBottomStyle",
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
    const name = "margin-bottom";
    const unit = "px";
    const { modifier } = modifiersUpdater(props, name);
    const { isNumeric } = helpers();

    const localStyleValue = ref(modifier.value?.slice(0, -2));

    watch(localStyleValue, (newVal) => {
      if (isNumeric(newVal)) {
        modifier.value = `${newVal}${unit}`;
      }
    });

    watch(modifier, (newVal) => {
      console.log("<<<<<<<< Changingg modifier >>>>>>>>>");

      localStyleValue.value = newVal?.slice(0, -2);
    });

    return {
      localStyleValue,
      name,
      unit,
    };
  },
});
</script>

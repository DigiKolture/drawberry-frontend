<template>
  <PanelStyle :name="name">
    <div class="number__row__style__container">
      <div class="panel__style__head">
        <h5>Margin bottom</h5>
      </div>
      <div class="number__row__style">
        <input v-model="marginBottom" />
        <span>PX</span>
      </div>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import store from "@/store";
import PanelStyle from "@/components/canvas/panel/styles/PanelStyle.vue";
import { modifiers } from "@/composables/canvas/panel/modifiers";
import { helpers } from "@/composables/helpers";

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

    const { updateStyle } = modifiers();
    const { isNumeric } = helpers();

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedChildrenElements = computed(
      () => store.getters["canvas/focusedChildrenElements"]
    );

    const getTargetElement = () =>
      props.childId
        ? focusedChildrenElements.value[props.childIndex]
        : focusedElement.value;

    const marginBottom = ref(
      getTargetElement().attributes.style.value[name]?.slice(0, -2)
    );
    const marginWithUnit = ref(getTargetElement().attributes.style.value[name]);

    watch(marginBottom, (newVal: string | number) => {
      if (!isNumeric(newVal)) {
        return;
      }
      if (typeof newVal === "string" && newVal.endsWith(unit)) {
        marginWithUnit.value = newVal;
      } else {
        marginWithUnit.value = newVal + unit;
      }
      updateStyle(name, marginWithUnit.value, props.childIndex);
    });

    watch(focusedElement, (newVal) => {
      marginBottom.value = newVal.attributes.style.value[name].slice(0, -2);
      marginWithUnit.value = newVal.attributes.style.value[name];
    });

    return {
      focusedElement,
      marginBottom,
      name,
      unit,
    };
  },
});
</script>

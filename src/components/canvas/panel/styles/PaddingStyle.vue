<template>
  <PanelStyle title="Padding">
    <div class="spacing__style">
      <div class="spacing__style__tab__item">
        <div class="spacing__style__outer__rect">
          <div
            :key="key"
            @click="changePaddingOption(option)"
            v-for="(option, key) in paddingOptions"
            :class="[option, { active: activePadding === option }]"
            class="spacing__style__inner__rect"
          >
            <span>{{ padding[option] }}</span>
          </div>
          <div
            @click="applyPaddingToAll"
            :class="{ active: activePadding === 'center' }"
            class="spacing__style__inner__rect center"
          >
            <span v-if="centerValue">{{ centerValue }}</span>
          </div>
        </div>
        <BaseSliderIcon
          v-model="singlePadding"
          icon="canvas/panel/styles/spacing"
        />
      </div>
      <p class="spacing__style__description">
        This spacing is applied to all sides of the inner component element
      </p>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseSliderIcon from "../BaseSliderIcon.vue";
import store from "@/store";
import { styles } from "@/composables/canvas/styles";

export default defineComponent({
  name: "PaddingStyle",
  components: { BaseSliderIcon, PanelStyle },
  props: {
    isParent: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  setup(props) {
    const name = "padding";
    const unit = "px";
    const { parsePadding, getDefaultPaddingValue, getDefaultPaddingPosition } =
      styles();

    const paddingOptions = ["top", "left", "right", "bottom"];

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    const focusedParentElement = computed(() => {
      return store.getters["canvas/focusedParentElement"];
    });

    let padding: any = reactive(
      !props.isParent
        ? parsePadding(focusedElement.value.attributes.style.value[name])
        : parsePadding(focusedParentElement.value.attributes.style.value[name])
    );

    const activePadding = ref(getDefaultPaddingPosition(padding));
    const singlePadding = ref(padding[activePadding.value] ?? padding.top);
    const centerValue: any = ref(getDefaultPaddingValue(padding));

    watch(activePadding, (newVal) => {
      if (activePadding.value !== "center") {
        singlePadding.value = padding[newVal];
      } else {
        singlePadding.value = centerValue.value;
      }
    });

    watch(singlePadding, (newVal) => {
      if (activePadding.value !== "center") {
        centerValue.value = 0;
        padding[activePadding.value] = newVal;
      } else {
        if (newVal) {
          centerValue.value = newVal;
          padding["top"] = newVal;
          padding["left"] = newVal;
          padding["right"] = newVal;
          padding["bottom"] = newVal;
        }
      }
    });

    watch(padding, (newVal) => {
      const newPadding = `${newVal.top}${unit} ${newVal.right}${unit} ${newVal.bottom}${unit} ${newVal.left}${unit}`;

      if (!props.isParent) {
        focusedElement.value.attributes.style.value[name] = newPadding;
        store.dispatch("canvas/updateFocusedElement", focusedElement.value);
      } else {
        focusedParentElement.value.attributes.style.value[name] = newPadding;
        store.dispatch(
          "canvas/updateFocusedParentElement",
          focusedParentElement.value
        );
      }
    });

    const changePaddingOption = (option: string) => {
      activePadding.value = option;
    };

    const applyPaddingToAll = () => {
      activePadding.value = "center";
    };

    return {
      singlePadding,
      activePadding,
      paddingOptions,
      changePaddingOption,
      applyPaddingToAll,
      padding,
      centerValue,
    };
  },
});
</script>

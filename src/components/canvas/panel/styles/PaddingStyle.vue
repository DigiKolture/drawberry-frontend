<template>
  <PanelStyle :title="`Padding`">
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
import { defineComponent, reactive, ref, watch } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseSliderIcon from "../BaseSliderIcon.vue";
import { styles } from "@/composables/canvas/styles";
import { modifiersUpdater } from "@/composables/canvas/modifiers/modifiers-updater";

export default defineComponent({
  name: "PaddingStyle",
  components: { BaseSliderIcon, PanelStyle },
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
    const name = "padding";
    const unit = "px";
    const { parsePadding, getDefaultPaddingValue, getDefaultPaddingPosition } =
      styles();

    const { modifier } = modifiersUpdater(props, name);

    const paddingOptions = ["top", "left", "right", "bottom"];

    let padding: any = reactive(parsePadding(modifier.value));

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

    watch(centerValue, (newVal) => {
      singlePadding.value = newVal;
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

    watch(
      () => ({ ...padding }),
      (newVal) => {
        modifier.value = `${newVal.top}${unit} ${newVal.right}${unit} ${newVal.bottom}${unit} ${newVal.left}${unit}`;
      }
    );

    watch(modifier, (newVal) => {
      const parsedPadding = parsePadding(newVal);
      Object.assign(padding, parsedPadding);
      centerValue.value = getDefaultPaddingValue(padding);
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

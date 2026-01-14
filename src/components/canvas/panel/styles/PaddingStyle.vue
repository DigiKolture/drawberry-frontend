<template>
  <PanelStyle :modifier="name" :title="`Padding`">
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
import { defineComponent, reactive, ref, watch, nextTick } from "vue";
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

    let padding: any = reactive(parsePadding(modifier.value || "0px"));

    const activePadding = ref(getDefaultPaddingPosition(padding));
    const singlePadding = ref(padding[activePadding.value] ?? padding.top);
    const centerValue: any = ref(getDefaultPaddingValue(padding));

    // Flag to prevent circular updates
    const isUpdatingFromModifier = ref(false);
    const isUpdatingFromUserInput = ref(false);

    watch(activePadding, (newVal, oldVal) => {
      // Update singlePadding to reflect the selected padding side's value
      if (newVal !== "center") {
        const newPaddingValue = padding[newVal];
        singlePadding.value = newPaddingValue;
        centerValue.value = 0;
      } else {
        singlePadding.value = centerValue.value;
      }
    });

    // Watch for modifier changes (from external updates, breakpoint changes, undo/redo)
    watch(modifier, (newVal) => {
      if (!newVal) return;

      isUpdatingFromModifier.value = true;

      const parsedPadding = parsePadding(newVal);
      Object.assign(padding, parsedPadding);

      // FIXED: Only update activePadding if we're not currently editing
      // This prevents the active padding from switching when user is making changes
      if (!isUpdatingFromUserInput.value) {
        activePadding.value = getDefaultPaddingPosition(padding);
      }

      // Update singlePadding to match current active padding value
      singlePadding.value = padding[activePadding.value] ?? padding.top;
      centerValue.value = getDefaultPaddingValue(padding);

      // Reset flag after Vue updates
      nextTick(() => {
        isUpdatingFromModifier.value = false;
      });
    });

    // Watch singlePadding to update the actual padding value
    watch(singlePadding, (newVal, oldVal) => {
      if (isUpdatingFromModifier.value) {
        return;
      }

      // Set flag to indicate user is making changes
      isUpdatingFromUserInput.value = true;

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

      // Clear the user input flag after a short delay
      setTimeout(() => {
        isUpdatingFromUserInput.value = false;
      }, 100);
    });

    // Watch padding object to update modifier
    watch(
      () => ({ ...padding }),
      (newVal) => {
        if (isUpdatingFromModifier.value) {
          return;
        }

        const newModifierValue = `${newVal.top}${unit} ${newVal.right}${unit} ${newVal.bottom}${unit} ${newVal.left}${unit}`;
        modifier.value = newModifierValue;
      }
    );

    const changePaddingOption = (option: string) => {
      activePadding.value = option;
      // Clear user input flag when manually changing padding option
      isUpdatingFromUserInput.value = false;
    };

    const applyPaddingToAll = () => {
      activePadding.value = "center";
      isUpdatingFromUserInput.value = false;
    };

    return {
      name,
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

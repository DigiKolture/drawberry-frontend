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

  setup() {
    const name = "padding";
    const unit = "px";
    const { parsePadding, getDefaultPaddingValue, getDefaultPaddingPosition } =
      styles();

    const paddingOptions = ["top", "left", "right", "bottom"];

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });

    let padding: any = reactive(
      parsePadding(focusedElement.value.attributes.style.value[name])
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
      focusedElement.value.attributes.style.value[
        name
      ] = `${newVal.top}${unit} ${newVal.right}${unit} ${newVal.bottom}${unit} ${newVal.left}${unit}`;
      store.commit("canvas/UPDATE_FOCUSED_JSON_AND_DOM", focusedElement.value);
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

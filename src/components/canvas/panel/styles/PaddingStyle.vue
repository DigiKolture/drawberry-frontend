<template>
  <PanelStyle title="Padding">
    <div class="spacing__style">
      <div class="spacing__style__tab__item">
        <div class="spacing__style__outer__rect">
          <div class="spacing__style__inner__rect top">
            <span>8</span>
          </div>
          <div class="spacing__style__inner__rect left">
            <span>8</span>
          </div>
          <div class="spacing__style__inner__rect right">
            <span>8</span>
          </div>
          <div class="spacing__style__inner__rect bottom">
            <span>8</span>
          </div>
          <div class="spacing__style__inner__rect center active">
            <span>8</span>
          </div>
        </div>
        <BaseSliderIcon icon="canvas/panel/styles/spacing" />
      </div>
      <p class="spacing__style__description">
        This spacing is applied to all sides of the inner component element
      </p>
    </div>
  </PanelStyle>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle.vue";
import BaseSliderIcon from "../BaseSliderIcon.vue";

export default defineComponent({
  name: "PaddingStyle",
  components: { BaseSliderIcon, PanelStyle },
});
</script>

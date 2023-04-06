<template>
  <PanelStyle title="Spacing">
    <div class="spacing__style">
      <PanelStyleTabs :titles="['Inner', 'Outer']">
        <div class="spacing__style__tab__item">
          <div class="spacing__style__outer__rect">
            <div class="spacing__style__outer__rect__common">
              <span>8</span>
            </div>
            <div class="spacing__style__outer__rect__mid">
              <div><span>8</span></div>
              <div class="spacing__style__inner__rect">
                <span>8</span>
              </div>
              <div><span>8</span></div>
            </div>
            <div class="spacing__style__outer__rect__common">
              <span>8</span>
            </div>
          </div>
          <BaseSliderIcon icon="canvas/panel/styles/spacing" />
        </div>
        <p class="spacing__style__description">
          This spacing is applied to all sides of the inner component element
        </p>
      </PanelStyleTabs>
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";
import PanelStyleTabs from "../PanelStyleTabs";
import BaseSliderIcon from "../BaseSliderIcon";

export default defineComponent({
  name: "SpacingStyle",
  components: { BaseSliderIcon, PanelStyleTabs, PanelStyle },
});
</script>

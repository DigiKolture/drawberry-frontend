<template>
  <div class="canvas__panel__tabs">
    <PanelTab title="Background">
      <div class="canvas__panel__styles">
        <PanelStyle title="Border radius">
          <div class="border__radius__style">
            <div class="border__radius__style__icon"></div>
            <BaseSlider v-model="slider" />
          </div>
        </PanelStyle>
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
            </PanelStyleTabs>
          </div>
        </PanelStyle>
      </div>
    </PanelTab>
  </div>
</template>
<script>
import { defineComponent, ref } from "vue";
import PanelTab from "./PanelTab";
import PanelStyle from "../styles/PanelStyle";
import BaseSlider from "@/components/canvas/panel/BaseSlider";
import PanelStyleTabs from "@/components/canvas/panel/PanelStyleTabs";
import BaseSliderIcon from "@/components/canvas/panel/BaseSliderIcon";

export default defineComponent({
  name: "PanelTabs",
  components: {
    BaseSliderIcon,
    PanelStyleTabs,
    BaseSlider,
    PanelStyle,
    PanelTab,
  },
  setup() {
    const slider = ref(15);

    return {
      slider,
    };
  },
});
</script>

<template>
  <PanelStyle title="Font">
    <div class="font__style">
      <select class="canvas__select" name="" id="">
        <option value="">DB Sans</option>
        <option value="">AirBnB</option>
        <option value="">Open Sans</option>
      </select>
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";

export default defineComponent({
  name: "FontStyle",
  components: { PanelStyle },
});
</script>

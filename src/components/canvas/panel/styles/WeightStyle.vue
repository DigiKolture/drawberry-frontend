<template>
  <PanelStyle title="Weight">
    <div class="font__weight__style">
      <select class="canvas__select" name="" id="">
        <option value="">400</option>
        <option value="">500</option>
        <option value="">700</option>
      </select>
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";

export default defineComponent({
  name: "WeightStyle",
  components: { PanelStyle },
});
</script>

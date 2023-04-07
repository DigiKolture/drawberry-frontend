<template>
  <PanelStyle title="Size">
    <div class="font__size__style">
      <input class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";

export default defineComponent({
  name: "FontSizeStyle",
  components: { PanelStyle },
});
</script>

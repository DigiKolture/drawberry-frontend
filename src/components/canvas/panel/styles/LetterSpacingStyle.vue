<template>
  <PanelStyle title="Letter spacing">
    <div class="font__size__style">
      <input class="canvas__input__number" type="number" />
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";

export default defineComponent({
  name: "LetterSpacingStyle",
  components: { PanelStyle },
});
</script>

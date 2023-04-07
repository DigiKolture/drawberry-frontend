<template>
  <PanelStyle title="Content">
    <div class="content__style">
      <textarea class="canvas__textarea" name="" id=""> </textarea>
    </div>
  </PanelStyle>
</template>
<script>
import { defineComponent } from "vue";
import PanelStyle from "./PanelStyle";

export default defineComponent({
  name: "ContentStyle",
  components: { PanelStyle },
});
</script>

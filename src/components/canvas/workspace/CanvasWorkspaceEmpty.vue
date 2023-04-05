<template>
  <div class="canvas__workspace__empty">
    <p>
      Hit the <span>+</span> button to <span>drag and drop</span> components
      from the component panel
    </p>
    <button>
      <BaseIcon icon="add" />
    </button>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import BaseIcon from "../../icon/BaseIcon";

export default defineComponent({
  name: "CanvasWorkspaceEmpty",
  components: { BaseIcon },
});
</script>

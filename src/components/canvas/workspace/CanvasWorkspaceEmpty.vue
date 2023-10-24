<template>
  <div class="canvas__workspace__empty">
    <p>
      Hit the <span>+</span> button to <span>drag and drop</span> components
      from the component panel
    </p>
    <button @click="openSidebar">
      <BaseIcon icon="add" />
    </button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "../../icon/BaseIcon.vue";
import store from "@/store";

export default defineComponent({
  name: "CanvasWorkspaceEmpty",
  components: { BaseIcon },

  setup() {
    const openSidebar = () => {
      store.commit("canvas/SET_SIDEBAR_NAVBAR_CONTENT", "add_component");
    };

    return {
      openSidebar,
    };
  },
});
</script>

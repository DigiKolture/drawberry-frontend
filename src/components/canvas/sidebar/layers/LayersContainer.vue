<template>
  <div class="layers__container">
    <div class="layers__component__items">
      <LayersContainerItem
        :key="component.id"
        v-for="(component, itemIndex) in workspaceComponents"
        :componentItem="component"
        :itemIndex="itemIndex"
      />
      <LayerLastContainerElementDecoy v-if="workspaceComponents.length > 0" />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import LayersContainerItem from "@/components/canvas/sidebar/layers/LayersContainerItem.vue";
import store from "@/store";
import LayerLastContainerElementDecoy from "@/components/canvas/sidebar/layers/LayerLastContainerElementDecoy.vue";

export default defineComponent({
  name: "LayersContainer",
  components: {
    LayerLastContainerElementDecoy,
    LayersContainerItem,
  },

  setup() {
    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    return {
      workspaceComponents,
    };
  },
});
</script>

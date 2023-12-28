<template>
  <div class="layers__container">
    <div class="layers__component__items">
      <LayersContainerItem
        :key="component.id"
        v-for="(component, itemIndex) in workspaceComponents"
        :componentItem="component"
        :itemIndex="itemIndex"
        :show-elements="tabStates[itemIndex]"
      />
      <LayerLastContainerElementDecoy v-if="workspaceComponents.length > 0" />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, watch } from "vue";
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

    const tabStates = computed(() => {
      return store.getters["layers/tabStates"];
    });

    return {
      tabStates,
      workspaceComponents,
    };
  },
});
</script>

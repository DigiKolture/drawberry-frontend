<template>
  <div class="layers__container">
    <div class="layers__component__items">
      <LayersContainerItem
        :key="component.id"
        v-for="(component, itemIndex) in workspaceComponents"
        :componentItem="component"
        :itemIndex="itemIndex"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import LayersContainerItem from "@/components/canvas/sidebar/layers/LayersContainerItem.vue";
import store from "@/store";

export default defineComponent({
  name: "LayersContainer",
  components: { LayersContainerItem },

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

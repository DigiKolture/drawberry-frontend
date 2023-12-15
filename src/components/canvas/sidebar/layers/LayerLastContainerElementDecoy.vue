<template>
  <div class="layers__component__item">
    <LayerElementDropIndicator v-if="drop" />
    <div
      class="layers__component__item__header decoy"
      @drop="dropComponentItemLayer($event)"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @dragover.prevent
      @dragenter.prevent
    ></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import LayerElementDropIndicator from "@/components/canvas/sidebar/layers/utilities/LayerElementDropIndicator.vue";
import store from "@/store";
import { drag_and_drop } from "@/composables/canvas/drag_and_drop";

export default defineComponent({
  name: "LayerLastContainerElementDecoy",
  components: { LayerElementDropIndicator },

  setup() {
    const drop = ref(false);
    const { changeComponentItemPosition } = drag_and_drop();

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const itemIndex = computed(() => {
      return workspaceComponents.value.length;
    });

    const dropComponentItemLayer = async (e: any) => {
      const fromIndex = e.dataTransfer.getData("fromLayerComponentItemIndex");
      if (!fromIndex) return;

      drop.value = false;

      await changeComponentItemPosition(parseInt(fromIndex), itemIndex.value);
    };

    const handleDragOver = (e) => {
      let fromIndex = e.dataTransfer.getData("fromLayerComponentItemIndex");
      let toIndex = itemIndex.value;
      if (fromIndex) fromIndex = parseInt(fromIndex);
      else return;
      if (fromIndex == toIndex) return;
      if (fromIndex < toIndex && Math.abs(fromIndex - toIndex) < 2) return;
      if (toIndex > fromIndex && Math.abs(fromIndex - toIndex) < 1) return;

      drop.value = true;
    };

    const handleDragLeave = () => {
      drop.value = false;
    };

    return {
      itemIndex,
      drop,
      dropComponentItemLayer,
      handleDragOver,
      handleDragLeave,
    };
  },
});
</script>

<style scoped></style>

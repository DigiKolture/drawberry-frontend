<template>
  <div class="export__footer">
    <ActionDropdownItem
      @click="downloadProjectHTML"
      :title="downloadData.name"
      :icon="downloadData.icon"
      :class="{ disabled }"
      :disabled="disabled"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ActionDropdownItem from "@/components/dropdown/ActionDropdownItem.vue";
import store from "@/store";

export default defineComponent({
  name: "DownloadProjectHTML",
  components: { ActionDropdownItem },

  setup() {
    const downloadData = {
      icon: "header/export/download",
      name: "Download HTML",
    };

    const disabled = ref(false);

    const downloadProjectHTML = async () => {
      disabled.value = true;
      // Compile-and-store the current Canvas first so the backend serves a fresh Compiled
      // email HTML (ADR-0005: recompile before download).
      await store.dispatch("canvas/recompileAndStore");
      store
        .dispatch("connectors/downloadProject")
        .then(() => {
          disabled.value = false;
          store.commit("modals/CLOSE_MODAL", "export");
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    return {
      disabled,
      downloadData,
      downloadProjectHTML,
    };
  },
});
</script>

<style scoped></style>

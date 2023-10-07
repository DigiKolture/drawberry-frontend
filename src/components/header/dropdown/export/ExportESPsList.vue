<template>
  <ActionDropdownItem
    @click="exportProject(esp_item.esp)"
    v-for="esp_item in esps"
    :key="esp_item.id"
    :title="`Send to ${capitalizeFirstLetter(esp_item.esp)}`"
    :icon="`header/export/${esp_item.esp}`"
    subtitle="App connected"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import { useRoute } from "vue-router";
import ActionDropdownItem from "@/components/dropdown/ActionDropdownItem.vue";
import { helpers } from "@/composables/helpers";

export default defineComponent({
  name: "ExportESPsList",
  components: { ActionDropdownItem },
  setup() {
    const route = useRoute();

    const { capitalizeFirstLetter } = helpers();

    const esps = computed(() => {
      return store.getters["esp/esps"];
    });

    const exportProject = (esp: string) => {
      store
        .dispatch("esp/exportProject", {
          esp,
          projectId: route.params.id,
        })
        .catch(() => {
          window.location.reload();
        });
    };

    return {
      esps,
      capitalizeFirstLetter,
      exportProject,
    };
  },
});
</script>

<style></style>

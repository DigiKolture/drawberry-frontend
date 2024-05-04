<template>
  <ActionDropdownItem
    @click="exportProject(esp_item.esp)"
    v-for="esp_item in esps"
    :key="esp_item.id"
    :type="esp_item.esp"
    :title="`Send to ${capitalizeFirstLetter(esp_item.esp)}`"
    :icon="`header/export/${esp_item.esp}`"
    :subtitle="esp_item.accountEmail"
    :disabled="disabled"
    :current="current"
    :class="{ disabled }"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
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

    const disabled = ref(false);
    const current = ref("");

    const esps = computed(() => {
      return store.getters["esp/esps"];
    });

    const exportProject = (esp: string) => {
      disabled.value = true;
      current.value = esp;
      store
        .dispatch("esp/exportProject", {
          esp,
          projectId: route.params.id,
        })
        .then(() => {
          disabled.value = false;
          store.commit("modals/CLOSE_MODAL", "export");

          let message = "";
          if (esp === "google") {
            message = "Email template sent to drafts in Gmail";
          } else {
            message = `Email template sent to ${esp}`;
          }
          store.dispatch("toast/showToast", {
            message,
          });
        })
        .catch(() => {
          disabled.value = false;
          store.dispatch("toast/showToast", {
            message: `Authorisation error. Please check connected ${esp} account`,
            type: "error",
          });
          store.dispatch("esp/getESPs");
        });
    };

    return {
      esps,
      current,
      disabled,
      capitalizeFirstLetter,
      exportProject,
    };
  },
});
</script>

<style></style>

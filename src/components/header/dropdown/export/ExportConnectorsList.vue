<template>
  <ActionDropdownItem
    @click="exportProject(connection.connectorKey)"
    v-for="connection in connections"
    :key="connection.id || connection.connectorKey"
    :type="connection.connectorKey"
    :title="`Send to ${capitalizeFirstLetter(connection.connectorKey)}`"
    :icon="`header/export/${connection.connectorKey}`"
    :subtitle="connection.accountEmail"
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
  name: "ExportConnectorsList",
  components: { ActionDropdownItem },
  setup() {
    const route = useRoute();
    const { capitalizeFirstLetter } = helpers();

    const disabled = ref(false);
    const current = ref("");

    const connections = computed(() => {
      return store.getters["connectors/connections"];
    });

    const exportProject = (connector: string) => {
      disabled.value = true;
      current.value = connector;
      store
        .dispatch("connectors/exportProject", {
          connector,
          projectId: route.params.id,
        })
        .then(() => {
          disabled.value = false;
          store.commit("modals/CLOSE_MODAL", "export");

          const message =
            connector === "google"
              ? "Email template sent to drafts in Gmail"
              : `Email template sent to ${connector}`;
          store.dispatch("toast/showToast", { message });
        })
        .catch(() => {
          disabled.value = false;
          store.dispatch("toast/showToast", {
            message: `Authorisation error. Please check connected ${connector} account`,
            type: "error",
          });
          store.dispatch("connectors/fetchConnections");
        });
    };

    return {
      connections,
      current,
      disabled,
      capitalizeFirstLetter,
      exportProject,
    };
  },
});
</script>

<style></style>

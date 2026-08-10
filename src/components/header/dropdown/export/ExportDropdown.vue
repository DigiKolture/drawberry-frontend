<template>
  <div id="modals" class="header-export action__dropdown">
    <div class="export__empty" v-if="isConnectionsEmpty">
      <div class="export__empty__icons">
        <div
          class="export__empty__icon"
          :key="entry.key"
          v-for="entry in catalog"
        >
          <BaseIcon :icon="`header/export/${entry.icon}`" />
        </div>
      </div>
      <div class="export__empty__content">
        <h6>No connected apps</h6>
        <p>You haven't let any apps access your account yet.</p>
        <BaseButton
          @click="openManage"
          class="button__outline"
          title="Manage apps"
        />
      </div>
    </div>
    <div class="export__connectors" v-else>
      <div class="export__connectors__header">
        <h5>Connected apps</h5>
        <button @click="openManage"><BaseIcon icon="settings" /></button>
      </div>
      <div class="export__connectors__lists">
        <ExportConnectorsList />
        <ActionDropdownItem
          @click="openManage"
          class="export__connectors__lists__add"
          title="Add new app"
          icon="add"
          subtitle="5+ apps to integrate with"
        />
      </div>
    </div>
    <DownloadProjectHTML />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import store from "@/store";
import BaseButton from "@/components/layout/BaseButton.vue";
import ActionDropdownItem from "@/components/dropdown/ActionDropdownItem.vue";
import ExportConnectorsList from "@/components/header/dropdown/export/ExportConnectorsList.vue";
import { helpers } from "@/composables/helpers";
import DownloadProjectHTML from "@/components/header/dropdown/export/DownloadProjectHTML.vue";

export default defineComponent({
  name: "ExportDropdown",
  components: {
    DownloadProjectHTML,
    ExportConnectorsList,
    ActionDropdownItem,
    BaseButton,
    BaseIcon,
  },

  setup(props, { emit }) {
    const { capitalizeFirstLetter } = helpers();

    onMounted(() => {
      // The empty-state icons and the connected list are both driven by the
      // backend catalog + the user's connections.
      store.dispatch("connectors/fetchCatalog");
      store.dispatch("connectors/fetchConnections");
    });

    const catalog = computed(() => {
      return store.getters["connectors/catalog"];
    });

    const connections = computed(() => {
      return store.getters["connectors/connections"];
    });

    const isConnectionsEmpty = computed(() => {
      return connections.value.length === 0;
    });

    const callEvent = (dropdown: any) => {
      if (dropdown.event) emit("events", dropdown.event);
    };

    const openManage = () => {
      store.commit("modals/CLOSE_MODAL", "export");
      store.commit("modals/OPEN_MODAL", "manage_connectors");
    };

    return {
      callEvent,
      catalog,
      connections,
      capitalizeFirstLetter,
      isConnectionsEmpty,
      openManage,
    };
  },
});
</script>

<style></style>

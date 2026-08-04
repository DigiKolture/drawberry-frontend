<template>
  <div class="manage__esps">
    <div class="manage__esps__header">
      <h4>Connected apps</h4>
      <BaseButtonIcon
        @click="close"
        class="manage__esps__header__close"
        icon="close"
      />
    </div>
    <div class="manage__esps__list">
      <p v-if="!catalog.length" class="manage__esps__empty">
        Loading connected apps…
      </p>
      <ManageConnectorListItem
        v-for="entry in catalog"
        :key="entry.key"
        :entry="entry"
      />
    </div>

    <LLMPromptForm />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import BaseButtonIcon from "@/components/icon/BaseButtonIcon.vue";
import ManageConnectorListItem from "@/components/connectors/ManageConnectorListItem.vue";
import LLMPromptForm from "@/components/llm/LLMPromptForm.vue";
import store from "@/store";

export default defineComponent({
  name: "ManageConnectors",
  components: { LLMPromptForm, ManageConnectorListItem, BaseButtonIcon },
  setup() {
    const catalog = computed(() => store.getters["connectors/catalog"]);

    onMounted(() => {
      // The whole Manage list — providers and their form fields — is rendered
      // from the backend-served catalog; nothing about any connector is
      // hardcoded here.
      store.dispatch("connectors/fetchCatalog");
      store.dispatch("connectors/fetchConnections");
    });

    const close = () => {
      store.commit("modals/CLOSE_MODAL", "manage_esp");
    };

    return {
      catalog,
      close,
    };
  },
});
</script>

<style scoped>
.manage__esps__empty {
  font-size: 12px;
  color: #7c828f;
}
</style>

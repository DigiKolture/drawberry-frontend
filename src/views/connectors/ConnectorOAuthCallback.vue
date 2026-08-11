<template>
  <div class="oauth__callback">Connecting…</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "@/store";

// Where to return the user after the provider redirects back. The callback is
// a fresh full-page load, so the projects store has no current project — the
// canvas that started the connect stashes its id here first (see
// ManageConnectorListItem).
const RETURN_PROJECT_KEY = "connector_oauth_return_project";

export default defineComponent({
  name: "ConnectorOAuthCallback",

  computed: {
    project() {
      return store.getters["projects/project"];
    },
  },

  async mounted() {
    const connector = this.$route.params.connector as string;

    try {
      await store.dispatch("connectors/connectOAuth", {
        connector,
        data: this.$route.query,
      });
      store.dispatch("toast/showToast", { message: `${connector} connected` });
    } catch (err: any) {
      store.dispatch("toast/showToast", {
        message: (err && err.message) || `Could not connect ${connector}`,
        type: "error",
      });
    }

    const projectId =
      (this.project && this.project.id) ||
      localStorage.getItem(RETURN_PROJECT_KEY);
    localStorage.removeItem(RETURN_PROJECT_KEY);

    if (projectId) {
      this.$router.push({ name: "Canvas", params: { id: projectId } });
    } else {
      this.$router.push({ name: "ProjectIndex" });
    }
  },
});
</script>

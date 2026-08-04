<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "@/store";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "ConnectorOAuthCallback",

  computed: {
    project() {
      return store.getters["projects/project"];
    },
  },

  async mounted() {
    const route = this.$route;
    const router = useRouter();

    const query = route.query;
    const params = route.params;

    await store.dispatch("connectors/connectOAuth", {
      connector: params.connector,
      data: query,
    });
    router.push({ name: "Canvas", params: { id: this.project.id } });
  },
});
</script>

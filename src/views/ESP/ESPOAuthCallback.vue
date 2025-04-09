<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from "@/store";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "ESPOAuthCallback",

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

    // console.log({ query });
    // console.log({ params });

    await store.dispatch("esp/connectESP", {
      esp: params.esp,
      data: query,
    });
    router.push({ name: "Canvas", params: { id: this.project.id } });
  },
});
</script>

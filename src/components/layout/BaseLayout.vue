<template>
  <div class="base">
    <Header />

    <main class="main">
      <slot />
      <ManageESPs v-if="showESPMange" />
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import Header from "./Header.vue";
import ManageESPs from "@/components/esp/ManageESPs.vue";
import store from "@/store";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "BaseLayout",
  components: { ManageESPs, Header },

  setup() {
    const route = useRoute();

    const authUser = computed(() => {
      return store.getters["auth/authUser"];
    });

    const showManageESP = computed(() => {
      return store.getters["modals/manageESP"];
    });

    const isCanvas = computed(() => {
      return route.name === "Canvas";
    });

    const showESPMange = computed(() => {
      return authUser.value && isCanvas.value && showManageESP.value;
    });

    return {
      showESPMange,
    };
  },
});
</script>

<style></style>

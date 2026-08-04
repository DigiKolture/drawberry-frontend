<template>
  <div class="base" @click="handleGlobalClick">
    <Header />

    <main class="main" :class="{ 'small-screen': isSmallScreen }">
      <slot />
      <ManageConnectors v-if="showESPMange" />
    </main>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import Header from "./Header.vue";
import ManageConnectors from "@/components/connectors/ManageConnectors.vue";
import store from "@/store";
import { useRoute } from "vue-router";
import { screenConstraint } from "@/composables/canvas/screen-constraint";

export default defineComponent({
  name: "BaseLayout",
  components: { ManageConnectors, Header },

  setup() {
    const route = useRoute();
    const { isSmallScreen } = screenConstraint();

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

    onMounted(() => {
      store.dispatch("modals/closeAllModals");
    });

    const handleGlobalClick = (event: any) => {
      if (
        event.target.id === "modals" ||
        event.target.id === "modals-trigger"
      ) {
        return;
      }

      const modalElements = document.querySelectorAll("#modals");
      const modalTriggerElements = document.querySelectorAll("#modals-trigger");
      for (let i = 0; i < modalElements.length; i++) {
        const modalElement = modalElements[i];
        const modalTriggerElement = modalTriggerElements[i];
        if (
          (modalElement && modalElement.contains(event.target)) ||
          (modalTriggerElement && modalTriggerElement.contains(event.target))
        ) {
          return;
        }
      }
      store.dispatch("modals/closeModals");
    };

    return {
      showESPMange,
      isSmallScreen,
      handleGlobalClick,
    };
  },
});
</script>

<style></style>

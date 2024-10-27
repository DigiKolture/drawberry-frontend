<template>
  <CanvasLayout>
    <template v-slot:sidebar>
      <CanvasSidebarNav />
      <CanvasSidebarNavContent />
    </template>
    <template v-slot:workspace>
      <WorkspaceComponentItemsContainer />
    </template>
    <template v-slot:panel>
      <CanvasPanel />
    </template>
    <template v-slot:modals>
      <ShareProjectPreviewModal />
      <EmailPreviewModal />
      <ScreenSizeConstraint />
      <UserInitialsDropdown :class="{ open: openUserInitials }" />
    </template>
  </CanvasLayout>
</template>
<script>
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import store from "@/store";
import CanvasLayout from "@/components/layout/CanvasLayout";
import WorkspaceComponentItemsContainer from "@/components/canvas/workspace/component-items/WorkspaceComponentItemsContainer";
import CanvasSidebarNav from "@/components/canvas/sidebar/CanvasSidebarNav";
import CanvasSidebarNavContent from "@/components/canvas/sidebar/CanvasSidebarNavContent";
import CanvasPanel from "@/components/canvas/panel/CanvasPanel";
import ShareProjectPreviewModal from "@/components/canvas/modals/ShareProjectPreviewModal";
import UserInitialsDropdown from "@/components/header/dropdown/UserInitialsDropdown.vue";
import ScreenSizeConstraint from "@/components/canvas/modals/ScreenSizeConstraint.vue";
import {
  CanvasLoadingState,
  CanvasSaveStatus,
} from "@/store/modules/canvas/types";
import EmailPreviewModal from "@/components/header/preview/EmailPreviewModal.vue";
import { history } from "@/composables/canvas/history";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "CanvasPage",
  components: {
    EmailPreviewModal,
    ScreenSizeConstraint,
    UserInitialsDropdown,
    ShareProjectPreviewModal,
    CanvasPanel,
    CanvasSidebarNav,
    CanvasSidebarNavContent,
    WorkspaceComponentItemsContainer,
    CanvasLayout,
  },

  setup() {
    let intervalId = null;
    let isCallingApi = false;
    const route = useRoute();
    const projectId = route.params.id;

    const { undo, canUndo } = history();

    const saveStatus = computed(() => {
      return store.getters["canvas/saveStatus"];
    });

    const checkAndUpdate = async () => {
      if (saveStatus.value !== CanvasSaveStatus.SAVED && !isCallingApi) {
        isCallingApi = true;
        try {
          await store.dispatch("canvas/updateProjectComponentsAndStyles");
        } catch (error) {
          store.commit("canvas/SET_SAVE_STATUS", CanvasSaveStatus.PAUSED);
        } finally {
          isCallingApi = false;
        }
      }
    };

    onMounted(async () => {
      store.commit("canvas/SET_LOAD_STATE", CanvasLoadingState.IN_PROGRESS);

      // Await asynchronous tasks and set project data
      await Promise.all([
        store.dispatch("components/getComponents"),
        store.dispatch("canvas/getGoogleFonts"),
        store.dispatch("canvas/getProjectComponentItems", projectId),
        store.commit("projects/SET_PROJECT_ID", projectId),
      ]);

      // Close all right panels and mark as mounted
      store.commit("modals/CLOSE_ALL_RIGHT_PANELS");
      store.commit("canvas/SET_LOAD_STATE", CanvasLoadingState.SUCCESS);
      window.addEventListener("keydown", handleKeyPress);

      intervalId = setInterval(checkAndUpdate, 5000);
    });

    onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyPress);
      clearInterval(intervalId);
    });

    const selectedComponent = ref({});

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const openUserInitials = computed(() => {
      return store.getters["modals/userInitials"];
    });

    const handleKeyPress = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        store.commit("canvas/SET_SAVE_STATUS", CanvasSaveStatus.UPDATED);
        store.dispatch("canvas/updateProjectComponentsAndStyles");
        event.preventDefault();
      } else if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        if (canUndo.value) {
          undo();
        }
      }
    };

    return {
      project,
      openUserInitials,
      selectedComponent,
    };
  },
});
</script>

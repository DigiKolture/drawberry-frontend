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
      <ScreenSizeConstraint />
      <UserInitialsDropdown :class="{ open: openUserInitials }" />
    </template>
  </CanvasLayout>
</template>
<script>
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import store from "@/store";
import CanvasLayout from "@/components/layout/CanvasLayout";
import WorkspaceComponentItemsContainer from "@/components/canvas/workspace/component-items/WorkspaceComponentItemsContainer";
import CanvasSidebarNav from "@/components/canvas/sidebar/CanvasSidebarNav";
import CanvasSidebarNavContent from "@/components/canvas/sidebar/CanvasSidebarNavContent";
import CanvasPanel from "@/components/canvas/panel/CanvasPanel";
import ShareProjectPreviewModal from "@/components/canvas/modals/ShareProjectPreviewModal";
import UserInitialsDropdown from "@/components/header/dropdown/UserInitialsDropdown.vue";
import ScreenSizeConstraint from "@/components/canvas/modals/ScreenSizeConstraint.vue";
import { CanvasSaveStatus } from "@/store/modules/canvas/types";

export default defineComponent({
  name: "CanvasPage",
  components: {
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

    const saveStatus = computed(() => {
      return store.getters["canvas/saveStatus"];
    });

    const checkAndUpdate = async () => {
      if (saveStatus.value !== CanvasSaveStatus.SAVED && !isCallingApi) {
        isCallingApi = true;
        try {
          await store.dispatch("canvas/updateProjectComponentsAndStyles");
        } catch (error) {
          store.commit("canvas/SET_SAVE_STATUS", CanvasSaveStatus.OFFLINE);
        } finally {
          isCallingApi = false;
        }
      }
    };

    onMounted(() => {
      store.dispatch("components/getComponents");
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

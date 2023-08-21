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
    </template>
  </CanvasLayout>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import CanvasLayout from "@/components/layout/CanvasLayout";
import WorkspaceComponentItemsContainer from "@/components/canvas/workspace/component-items/WorkspaceComponentItemsContainer";
import CanvasSidebarNav from "@/components/canvas/sidebar/CanvasSidebarNav";
import CanvasSidebarNavContent from "@/components/canvas/sidebar/CanvasSidebarNavContent";
import CanvasPanel from "@/components/canvas/panel/CanvasPanel";
import ShareProjectPreviewModal from "@/components/canvas/modals/ShareProjectPreviewModal";

export default defineComponent({
  name: "CanvasPage",
  components: {
    ShareProjectPreviewModal,
    CanvasPanel,
    CanvasSidebarNav,
    CanvasSidebarNavContent,
    WorkspaceComponentItemsContainer,
    CanvasLayout,
  },

  setup() {
    onMounted(() => {
      store.dispatch("components/getComponents");
      store.dispatch("canvas/getGoogleFonts");
      // store.commit("canvas/SET_WORKSPACE_COMPONENTS", []);
    });

    const selectedComponent = ref({});

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    return {
      project,
      selectedComponent,
    };
  },
});
</script>

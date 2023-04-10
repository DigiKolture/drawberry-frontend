<template>
  <CanvasLayout>
    <template v-slot:sidebar>
      <ComponentsContainer />
      <ComponentItemsContainer />
    </template>
    <template v-slot:workspace>
      <WorkspaceComponentItemsContainer />
    </template>
    <template v-slot:panel>
      <PanelTabs />
    </template>
  </CanvasLayout>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import CanvasLayout from "@/components/layout/CanvasLayout";
import ComponentsContainer from "@/components/canvas/sidebar/components/ComponentsContainer";
import ComponentItemsContainer from "@/components/canvas/sidebar/component-items/ComponentItemsContainer";
import WorkspaceComponentItemsContainer from "@/components/canvas/workspace/component-items/WorkspaceComponentItemsContainer";
import PanelTabs from "@/components/canvas/panel/tabs/PanelTabs";

export default defineComponent({
  name: "CanvasPage",
  components: {
    PanelTabs,
    WorkspaceComponentItemsContainer,
    ComponentItemsContainer,
    ComponentsContainer,
    CanvasLayout,
  },

  setup() {
    onMounted(() => {
      store.dispatch("components/getComponents");
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

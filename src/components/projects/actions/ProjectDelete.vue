<template>
  <ConfirmModal
    v-if="isOpen"
    title="Sure you want to delete this?"
    :description="description"
    :disabled="disabled"
    @confirm="confirmDelete"
    @cancel="cancel"
  />
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import store from "@/store";
import ConfirmModal from "@/components/helpers/ConfirmModal.vue";

export default defineComponent({
  name: "ProjectDelete",
  components: { ConfirmModal },
  setup() {
    const description = ref("");
    const project = ref(null);
    const isOpen = computed(() => {
      return store.getters["modals/projectDelete"];
    });
    const disabled = ref(false);

    const projectItemIndex = computed(() => {
      return store.getters["modals/projectItem"];
    });

    const projects = computed(() => {
      return store.getters["projects/projects"];
    });

    watch(projectItemIndex, () => {
      if (projectItemIndex.value >= 0) {
        // One was added to the project index when setting the value, so we need to subtract one
        project.value = projects.value[projectItemIndex.value - 1];
        description.value = `${
          projects.value[projectItemIndex.value - 1].name
        } will be deleted permanently.`;
      }
    });

    const confirmDelete = () => {
      disabled.value = true;
      store
        .dispatch("projects/deleteProject", project.value?.id)
        .then(() => {
          store.dispatch("projects/getProjects").then(() => {
            disabled.value = false;
            cancel();
            toastMessage(project.value?.id);
          });
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    const cancel = () => {
      store.commit("modals/CLOSE_MODAL", "project_delete");
    };

    const toastMessage = (projectId: string) => {
      store.dispatch("toast/showToast", {
        message: `Project deleted.`,
        data: {
          actionName: "Undo",
          action: "undo_project",
          body: {
            projectId,
          },
        },
      });
    };

    return {
      isOpen,
      disabled,
      description,
      confirmDelete,
      cancel,
    };
  },
});
</script>

<style></style>

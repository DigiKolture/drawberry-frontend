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

<script>
import { computed, defineComponent, ref, watch } from "vue";
import store from "@/store";
import ConfirmModal from "@/components/helpers/ConfirmModal.vue";
import { projectActions } from "@/composables/project/actions";

export default defineComponent({
  name: "ProjectDelete",
  components: { ConfirmModal },
  setup() {
    const disabled = ref(false);
    const { currentProjectId, description } = projectActions("delete");
    const isOpen = computed(() => {
      return store.getters["modals/projectDelete"];
    });

    const confirmDelete = () => {
      disabled.value = true;
      store
        .dispatch("projects/deleteProject", currentProjectId.value)
        .then(() => {
          disabled.value = false;
          cancel();
          toastMessage(currentProjectId.value);
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    const cancel = () => {
      store.commit("modals/CLOSE_MODAL", "project_delete");
    };

    const toastMessage = (projectId) => {
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

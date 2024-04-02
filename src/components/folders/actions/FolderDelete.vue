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
import { computed, defineComponent, ref } from "vue";
import store from "@/store";
import ConfirmModal from "@/components/helpers/ConfirmModal.vue";
import { folderActions } from "@/composables/folder/actions";

export default defineComponent({
  name: "FolderDelete",
  components: { ConfirmModal },
  setup() {
    const disabled = ref(false);
    const { currentFolderId, description } = folderActions("delete");
    const isOpen = computed(() => {
      return store.getters["modals/folderDelete"];
    });

    const confirmDelete = () => {
      disabled.value = true;
      store
        .dispatch("folders/deleteFolder", currentFolderId.value)
        .then(() => {
          disabled.value = false;
          cancel();
          toastMessage(currentFolderId.value);
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    const cancel = () => {
      store.commit("modals/CLOSE_MODAL", "folder_delete");
    };

    const toastMessage = (folderId) => {
      store.dispatch("toast/showToast", {
        message: `Folder deleted.`,
        data: {
          actionName: "Undo",
          action: "undo_delete",
          body: {
            folderId,
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

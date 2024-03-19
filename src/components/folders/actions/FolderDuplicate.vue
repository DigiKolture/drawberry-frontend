<template>
  <ModalLayout @close="close" :open="isOpen">
    <template v-slot:heading>
      <h3 class="modal__title">Duplicate folder</h3>
    </template>
    <template v-slot:body>
      <form @submit.prevent="duplicateFolder">
        <div class="modal__content">
          <div class="form-group">
            <BaseLabel title="Folder name"></BaseLabel>
            <BaseInput v-model="name" required />
          </div>
        </div>
        <div class="modal__footer">
          <BaseButton @click="close" title="Cancel" />
          <BaseButton
            :disabled="disabled"
            class="success"
            title="Duplicate Folder"
            type="submit"
          />
        </div>
      </form>
    </template>
  </ModalLayout>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import ModalLayout from "@/components/layout/ModalLayout.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import store from "@/store";
import BaseLabel from "@/components/form/BaseLabel.vue";
import BaseInput from "@/components/form/BaseInput.vue";

export default defineComponent({
  name: "FolderDuplicate",
  components: { BaseInput, BaseLabel, BaseButton, ModalLayout },
  setup() {
    const currentFolderId = ref("");
    const name = ref("");
    const disabled = ref(false);

    const folderItemIndex = computed(() => {
      return store.getters["modals/folderItem"];
    });

    const folders = computed(() => {
      return store.getters["folders/folders"];
    });

    watch(folderItemIndex, () => {
      if (folderItemIndex.value >= 0) {
        // One was added to the folder index when setting the value, so we need to subtract one
        currentFolderId.value = folders.value[folderItemIndex.value - 1].id;
        name.value = `Copy of ${folders.value[folderItemIndex.value - 1].name}`;
      }
    });

    const isOpen = computed(() => {
      return store.getters["modals/folderDuplicate"];
    });
    const close = () => {
      store.commit("modals/CLOSE_MODAL", "folder_duplicate");
    };

    const duplicateFolder = async () => {
      disabled.value = true;
      store
        .dispatch("folders/duplicateFolder", {
          id: currentFolderId.value,
          data: {
            name: name.value,
          },
        })
        .then((data) => {
          store.dispatch("folders/getFolders").then(() => {
            disabled.value = false;
            close();
            toastMessage(data.folder.id);
          });
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    const toastMessage = (folderId: string) => {
      store.dispatch("toast/showToast", {
        message: `Folder duplicated successfully.`,
        data: {
          actionName: "Open",
          action: "open_folder",
          body: {
            folderId,
          },
        },
      });
    };

    return {
      disabled,
      isOpen,
      name,
      currentFolderId,
      close,
      duplicateFolder,
    };
  },
});
</script>

<style></style>

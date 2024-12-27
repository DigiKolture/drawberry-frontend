<template>
  <ModalLayout @close="close" :open="isOpen">
    <template v-slot:heading>
      <h3 class="modal__title">Create Folder</h3>
    </template>
    <template v-slot:body>
      <form @submit.prevent="storeFolder">
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
            title="Create Folder"
            type="submit"
          />
        </div>
      </form>
    </template>
  </ModalLayout>
</template>
<script>
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import BaseInput from "@/components/form/BaseInput";
import BaseLabel from "@/components/form/BaseLabel";
import BaseButton from "@/components/layout/BaseButton";
import store from "@/store";
import ModalLayout from "@/components/layout/ModalLayout";
import { folderActions } from "@/composables/folder/actions";

export default defineComponent({
  name: "FolderCreate",
  components: {
    ModalLayout,
    BaseButton,
    BaseLabel,
    BaseInput,
  },

  setup() {
    const { name } = folderActions();
    const disabled = ref(false);

    const isOpen = computed(() => {
      return store.getters["modals/folderCreate"];
    });

    watch(isOpen, () => {
      name.value = "";
    });

    const close = () => {
      store.commit("modals/CLOSE_MODAL", "folder_create");
    };

    const storeFolder = async () => {
      disabled.value = true;
      store
        .dispatch("folders/storeFolder", {
          name: name.value,
        })
        .then(() => {
          disabled.value = false;
          close();
          toastMessage();
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    const toastMessage = () => {
      store.dispatch("toast/showToast", {
        message: `Folder created successfully.`,
      });
    };

    return {
      name,
      disabled,
      isOpen,
      close,
      storeFolder,
    };
  },
});
</script>

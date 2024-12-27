<template>
  <ModalLayout @close="close" :open="isOpen">
    <template v-slot:heading>
      <h3 class="modal__title">Rename project</h3>
    </template>
    <template v-slot:body>
      <form @submit.prevent="updateProject">
        <div class="modal__content">
          <div class="form-group">
            <BaseLabel title="Project name"></BaseLabel>
            <BaseInput v-model="name" required />
          </div>
        </div>
        <div class="modal__footer">
          <BaseButton @click="close" title="Cancel" />

          <BaseButton
            :disabled="disabled"
            class="success"
            title="Save"
            type="submit"
          />
        </div>
      </form>
    </template>
  </ModalLayout>
</template>
<script>
import { computed, defineComponent, ref } from "vue";
import BaseInput from "@/components/form/BaseInput";
import BaseLabel from "@/components/form/BaseLabel";
import BaseButton from "@/components/layout/BaseButton";
import store from "@/store";
import ModalLayout from "@/components/layout/ModalLayout";
import { projectActions } from "@/composables/project/actions";

export default defineComponent({
  name: "ProjectUpdate",
  components: {
    ModalLayout,
    BaseButton,
    BaseLabel,
    BaseInput,
  },

  setup() {
    const { name, currentProjectId } = projectActions("update");

    const disabled = ref(false);

    const isOpen = computed(() => {
      return store.getters["modals/projectUpdate"];
    });

    const close = () => {
      store.commit("modals/CLOSE_MODAL", "project_update");
    };

    const updateProject = async () => {
      disabled.value = true;
      store
        .dispatch("projects/updateProjectName", {
          id: currentProjectId.value,
          data: {
            name: name.value,
          },
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
        message: `Project updated successfully.`,
      });
    };

    return {
      name,
      disabled,
      isOpen,
      close,
      updateProject,
    };
  },
});
</script>

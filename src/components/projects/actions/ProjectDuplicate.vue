<template>
  <ModalLayout class="share__project__preview" @close="close" :open="isOpen">
    <template v-slot:heading>
      <h3 class="modal__title">Duplicate project</h3>
    </template>
    <template v-slot:body>
      <form @submit.prevent="duplicateProject">
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
            title="Duplicate Project"
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
import { projectActions } from "@/composables/project/actions";

export default defineComponent({
  name: "ProjectDuplicate",
  components: { BaseInput, BaseLabel, BaseButton, ModalLayout },
  setup() {
    const { currentProjectId, name } = projectActions("duplicate");
    const disabled = ref(false);

    const isOpen = computed(() => {
      return store.getters["modals/projectDuplicate"];
    });
    const close = () => {
      store.commit("modals/CLOSE_MODAL", "project_duplicate");
    };

    const duplicateProject = async () => {
      disabled.value = true;
      store
        .dispatch("projects/duplicateProject", {
          id: currentProjectId.value,
          data: {
            name: name.value,
          },
        })
        .then((data) => {
          disabled.value = false;
          close();
          toastMessage(data.project.id);
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    const toastMessage = (projectId: string) => {
      store.dispatch("toast/showToast", {
        message: `Project duplicated successfully.`,
        data: {
          actionName: "Open",
          action: "open_project",
          body: {
            projectId,
          },
        },
      });
    };

    return {
      disabled,
      isOpen,
      name,
      currentProjectId,
      close,
      duplicateProject,
    };
  },
});
</script>

<style></style>

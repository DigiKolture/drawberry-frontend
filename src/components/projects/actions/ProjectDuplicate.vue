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
            <BaseInput v-model="project.name" required />
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
import { computed, defineComponent, reactive, ref, watch } from "vue";
import ModalLayout from "@/components/layout/ModalLayout.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import store from "@/store";
import BaseLabel from "@/components/form/BaseLabel.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import router from "@/router";

export default defineComponent({
  name: "ProjectDuplicate",
  components: { BaseInput, BaseLabel, BaseButton, ModalLayout },
  setup() {
    const project = reactive({
      name: "",
    });

    const currentProjectId = ref("");
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
        currentProjectId.value = projects.value[projectItemIndex.value - 1].id;
      }
    });

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
          data: project,
        })
        .then(() => {
          disabled.value = false;
          close();
          store.dispatch("projects/getProjects");
        })
        .catch(() => {
          disabled.value = false;
        });
    };

    return {
      disabled,
      isOpen,
      currentProjectId,
      project,
      close,
      duplicateProject,
    };
  },
});
</script>

<style></style>

<template>
  <div @click="openProject" class="projects__body__list__item">
    <div class="projects__body__item__header">
      <BaseIcon icon="projects/placeholder" />
    </div>
    <div class="projects__body__item__body">
      <div class="projects__body__item__body__content">
        <h3>{{ project.name }}</h3>
        <h4>{{ formatDate(project.createdAt) }}</h4>
      </div>
      <BaseIcon icon="hamburger/horizontal" />
    </div>
    <ProjectDropdown class="open" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { helpers } from "@/composables/helpers";
import router from "@/router";
import ProjectDropdown from "@/components/projects/ProjectDropdown.vue";

export default defineComponent({
  name: "ProjectListItem",
  components: { ProjectDropdown, BaseIcon },

  props: {
    project: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    const { formatDate } = helpers();

    const createProject = () => {
      emit("create-project");
    };

    const openProject = () => {
      router.push({ name: "Canvas", params: { id: props.project.id } });
    };

    return {
      createProject,
      openProject,
      formatDate,
    };
  },
});
</script>

<style></style>

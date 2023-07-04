<template>
  <div @click="openProject" class="projects__body__list__item">
    <div class="projects__body__item__header">
      <BaseIcon icon="projects/placeholder" />
    </div>
    <div class="projects__body__item__body">
      <div class="projects__body__item__body__content">
        <h3>{{ sliceString(project.name, 17) }}</h3>
        <h4>{{ formatDate(project.createdAt) }}</h4>
      </div>
      <BaseIcon icon="hamburger/horizontal" />
    </div>
    <ProjectDropdown class="" />
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
    const { formatDate, sliceString } = helpers();

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
      sliceString,
    };
  },
});
</script>

<style></style>

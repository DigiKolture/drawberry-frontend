<template>
  <div class="projects__body__list__item">
    <ProjectListItemPlaceholder @click="openProject" :project="project" />
    <div @click="openProject" class="projects__body__item__body">
      <div class="projects__body__item__body__content">
        <h3>{{ sliceString(project.name, 16) }}</h3>
        <h4>Edited {{ diffForHumans(project.updatedAt) }}</h4>
      </div>

      <span
        id="modals-trigger"
        class="projects__body__item__body__open"
        @click.stop="toggleOpen"
      >
        <BaseIcon icon="hamburger/horizontal" />
      </span>
    </div>
    <ProjectItemDropdown :open="open" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { helpers } from "@/composables/helpers";
import router from "@/router";
import ProjectItemDropdown from "@/components/projects/ProjectItemDropdown.vue";
import store from "@/store";
import ProjectListItemPlaceholder from "@/components/projects/ProjectListItemPlaceholder.vue";

export default defineComponent({
  name: "ProjectListItem",
  components: { ProjectListItemPlaceholder, ProjectItemDropdown, BaseIcon },

  props: {
    index: {
      type: Number,
      required: true,
    },
    project: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    const { diffForHumans, sliceString } = helpers();

    const createProject = () => {
      emit("create-project");
    };

    const openProject = () => {
      router.push({ name: "Canvas", params: { id: props.project.id } });
    };

    const open = computed(() => {
      return store.getters["modals/projectItem"] === props.index;
    });

    const toggleOpen = () => {
      store.commit("modals/TOGGLE_STRING_MODAL", {
        modal: "project_item",
        value: props.index,
      });
    };

    return {
      createProject,
      openProject,
      diffForHumans,
      sliceString,
      open,
      toggleOpen,
    };
  },
});
</script>

<style></style>

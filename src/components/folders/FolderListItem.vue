<template>
  <div class="folders__body__list__item">
    <BaseIcon icon="projects/folder" />
    <h6>Folder name</h6>
    <BaseIcon icon="hamburger/horizontal" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { helpers } from "@/composables/helpers";

export default defineComponent({
  name: "FolderListItem",
  components: { BaseIcon },

  props: {
    folder: {
      type: Object,
      required: false,
    },
  },

  setup(props, { emit }) {
    const { formatDate } = helpers();

    const createProject = () => {
      emit("create-project");
    };

    return {
      createProject,
      formatDate,
    };
  },
});
</script>

<style></style>

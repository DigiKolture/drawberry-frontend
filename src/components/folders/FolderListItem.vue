<template>
  <div class="folders__body__list__item">
    <span class="folders__body__list__item__icon"
      ><BaseIcon icon="projects/folder"
    /></span>
    <h6>{{ sliceString(folder.name, 10) }}</h6>
    <span @click.stop="toggleOpen" class="folders__list__item__hamburger">
      <BaseIcon icon="hamburger/horizontal" />
    </span>
    <FolderItemDropdown :class="{ open }" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { helpers } from "@/composables/helpers";
import FolderItemDropdown from "@/components/folders/FolderItemDropdown.vue";
import store from "@/store";

export default defineComponent({
  name: "FolderListItem",
  components: { FolderItemDropdown, BaseIcon },

  props: {
    index: {
      type: Number,
      required: true,
    },
    folder: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    const { formatDate, sliceString } = helpers();

    const createProject = () => {
      emit("create-project");
    };

    const open = computed(() => {
      return store.getters["modals/folderItem"] === props.index;
    });

    const toggleOpen = () => {
      store.commit("modals/TOGGLE_STRING_MODAL", {
        modal: "folder_item",
        value: props.index,
      });
    };

    return {
      createProject,
      formatDate,
      sliceString,
      open,
      toggleOpen,
    };
  },
});
</script>

<style></style>

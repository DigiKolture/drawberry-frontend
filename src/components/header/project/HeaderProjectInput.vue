<template>
  <div class="header__middle__input__container">
    <input
      v-model="project.name"
      type="text"
      ref="inputField"
      @keyup.enter="updateProjectName"
      :disabled="isDisabled"
    />
    <BaseIcon :icon="`canvas/save/${saveStatus}`" />
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from "vue";

import store from "@/store";
import BaseIcon from "@/components/icon/BaseIcon.vue";
export default defineComponent({
  name: "HeaderProjectInput",
  components: { BaseIcon },
  props: {
    isDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup(props) {
    const inputField = ref(null);

    const scrollInputToStart = () => {
      if (inputField.value) {
        inputField.value.scrollLeft = 0;
      }
    };

    onMounted(() => {
      scrollInputToStart();
    });

    const project = computed(() => {
      return store.getters["projects/project"];
    });

    const saveStatus = computed(() => {
      return store.getters["canvas/saveStatus"];
    });

    const updateProjectName = () => {
      if (props.isDisabled) {
        return;
      }
      store.dispatch("projects/updateProject", {
        id: project.value.id,
        data: {
          name: project.value.name,
        },
      });
      scrollInputToStart();
    };

    return {
      project,
      inputField,
      updateProjectName,
      saveStatus,
      scrollInputToStart,
    };
  },
});
</script>

<style></style>

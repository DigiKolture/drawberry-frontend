<template>
  <div class="header__middle__input__container">
    <input
      v-model="project.name"
      type="text"
      ref="inputField"
      @keyup.enter="updateProjectName"
      :disabled="isDisabled"
    />
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from "vue";

import store from "@/store";
export default defineComponent({
  name: "HeaderProjectInput",
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
      scrollInputToStart,
    };
  },
});
</script>

<style></style>

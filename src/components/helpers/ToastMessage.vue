<template>
  <div class="toast__message" v-if="visible" :class="type">
    <div>
      <BaseIcon :icon="`toast/${type}`" />
      <h6>{{ message }}</h6>
      <button @click="toastAction" v-if="data.actionName && !loading">
        {{ data.actionName }}
      </button>
      <BaseIcon
        v-if="data.actionName && loading"
        class="loader"
        icon="loader"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import store from "@/store";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import router from "@/router";

export default defineComponent({
  name: "ToastMessage",
  components: { BaseIcon },

  setup() {
    const loading = ref(false);
    const visible = computed(() => {
      return store.getters["toast/visible"];
    });
    const message = computed(() => {
      return store.getters["toast/message"];
    });
    const type = computed(() => {
      return store.getters["toast/type"];
    });
    const data = computed(() => {
      return store.getters["toast/data"];
    });

    const toastAction = () => {
      switch (data.value.action) {
        case "open_project": {
          store.commit("toast/HIDE_TOAST");
          router.push({
            name: "Canvas",
            params: { id: data.value.body.projectId },
          });
          break;
        }
        case "undo_project": {
          loading.value = true;
          store
            .dispatch("projects/undoDeletedProject", data.value.body.projectId)
            .then(() => {
              store.dispatch("projects/getProjects").then(() => {
                loading.value = false;
                store.dispatch("toast/showToast", {
                  message: `Project restored.`,
                });
              });
            });
          break;
        }
        case "undo_folder": {
          loading.value = true;
          store
            .dispatch("folders/undoDeletedFolder", data.value.body.folderId)
            .then(() => {
              store.dispatch("toast/showToast", {
                message: `Folder restored.`,
              });
              loading.value = false;
            });
          break;
        }
      }
    };

    return {
      visible,
      message,
      type,
      data,
      loading,
      toastAction,
    };
  },
});
</script>

<style scoped></style>

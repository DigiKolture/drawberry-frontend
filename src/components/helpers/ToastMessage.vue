<template>
  <div class="toast__message" v-if="visible" :class="type">
    <div>
      <BaseIcon :icon="`toast/${type}`" />
      <h6>{{ message }}</h6>
      <button @click="toastAction" v-if="data.actionName">
        {{ data.actionName }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import store from "@/store";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import router from "@/router";

export default defineComponent({
  name: "ToastMessage",
  components: { BaseIcon },

  setup() {
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
      store.commit("toast/HIDE_TOAST");
      switch (data.value.action) {
        case "open_project": {
          router.push({
            name: "Canvas",
            params: { id: data.value.body.projectId },
          });
          break;
        }
        case "undo_project": {
          store
            .dispatch("projects/undoDeletedProject", data.value.body.projectId)
            .then(() => {
              store.dispatch("projects/getProjects");
            });
          break;
        }
        case "undo_delete": {
          store.dispatch("folders/undoDeletedFolder", data.value.body.folderId);
          break;
        }
      }
    };

    return {
      visible,
      message,
      type,
      data,
      toastAction,
    };
  },
});
</script>

<style scoped></style>

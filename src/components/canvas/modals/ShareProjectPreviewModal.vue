<template>
  <ModalLayout class="share__project__preview" @close="close" :open="isOpen">
    <template v-slot:heading>
      <h3 class="modal__title">Share a view-only link</h3>
      <p class="modal__description">
        Anybody wth this link will be able to view your email design - no login
        required
      </p>
    </template>
    <template v-slot:body>
      <div>
        <div class="modal__content">
          <div class="share__project__preview__link">
            <BaseIcon icon="link" />
            <a :href="previewURL" target="_blank">{{
              sliceString(previewURL, 59)
            }}</a>
          </div>
        </div>
        <div class="modal__footer">
          <BaseButton
            @click="copyURL"
            class="success"
            :title="copied ? 'Copied!' : 'Copy link'"
          />
        </div>
      </div>
    </template>
  </ModalLayout>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import ModalLayout from "@/components/layout/ModalLayout.vue";
import BaseButton from "@/components/layout/BaseButton.vue";
import store from "@/store";
import router from "@/router";
import { helpers } from "@/composables/helpers";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "ShareProjectPreviewModal",
  components: { BaseIcon, BaseButton, ModalLayout },
  setup() {
    const { sliceString, copy } = helpers();
    const baseURL = process.env.VUE_APP_BASE_URL;
    const route = useRoute();
    const copied = ref(false);

    onMounted(() => {
      copied.value = false;
    });

    const previewURL = computed(() => {
      const url = router.resolve({
        name: "Preview",
        params: { id: route.params.id },
      }).href;
      return `${baseURL}${url}`;
    });

    const isOpen = computed(() => {
      return store.getters["modals/sharePreview"];
    });

    const close = () => {
      copied.value = false;
      store.commit("modals/CLOSE_MODAL", "share_preview");
    };

    const copyURL = () => {
      copy(previewURL.value);
      copied.value = true;
    };

    return {
      copied,
      close,
      isOpen,
      previewURL,
      sliceString,
      copyURL,
    };
  },
});
</script>

<style></style>

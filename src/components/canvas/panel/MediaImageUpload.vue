<template>
  <button @click="handleUploadClick" class="content__style__media__upload">
    <span>Replace Image</span>
    <BaseIcon icon="canvas/panel/styles/media/upload" />
  </button>
  <input
    type="file"
    class="hidden"
    ref="fileInputRef"
    @change="handleImageUpload"
    accept="image/*"
  />
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import store from "@/store";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "MediaImageUpload",
  components: { BaseIcon },

  setup() {
    const name = "src";

    const focusedElement = computed(() => {
      return store.getters["canvas/focusedElement"];
    });
    let activeIndex = ref(0);
    const fileInputRef: any = ref(null);

    onMounted(() => {
      fileInputRef.value = document.querySelector('input[type="file"]');
    });

    const handleUploadClick = () => {
      fileInputRef.value.click();
    };

    const handleImageUpload = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        console.log(file);
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const base64Image = e.target.result;
          await uploadToServer(base64Image);
        };
        reader.readAsDataURL(file);
      }
    };

    const uploadToServer = async (image: string) => {
      console.log(image);
      const res = await store.dispatch("canvas/uploadImageToCloudinary", {
        image,
        folder: "drawberry/styles/images",
      });
      if (res.error || !res.url) return;
      console.log(res.url);
      focusedElement.value.attributes[name].value = res.url;
      await store.dispatch("canvas/updateFocusedElement", focusedElement.value);
    };

    return {
      activeIndex,
      handleUploadClick,
      handleImageUpload,
    };
  },
});
</script>

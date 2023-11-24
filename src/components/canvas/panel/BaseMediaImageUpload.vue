<template>
  <button @click="handleUploadClick" class="content__style__media__upload">
    <span>Replace Image</span>
    <BaseIcon icon="canvas/panel/styles/media/upload" />
    <input
      type="file"
      class="hidden"
      ref="fileInputRef"
      @change="handleImageUpload"
      accept="image/*"
    />
  </button>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import store from "@/store";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "BaseMediaImageUpload",
  components: { BaseIcon },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  setup(_, { emit }) {
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
        // console.log(file);
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const base64Image = e.target.result;
          await uploadToServer(base64Image);
        };
        reader.readAsDataURL(file);
      }
    };

    const uploadToServer = async (image: string) => {
      const res = await store.dispatch("canvas/uploadImageToCloudinary", {
        image,
        folder: "drawberry/styles/images",
      });
      if (res.error || !res.url) return;
      emit("update:modelValue", res.url);
      emit("update", res.url);
    };

    return {
      activeIndex,
      handleUploadClick,
      handleImageUpload,
    };
  },
});
</script>

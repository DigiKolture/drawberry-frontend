<template>
  <div
    @click="handleUploadClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    class="content__style__media__upload"
    :class="{ disabled: isLoading }"
  >
    <span class="content__media__add__image" v-if="!modelValue">Add Image</span>
    <div class="content__style__media__upload__has__img" v-else>
      <img v-if="!isHovered" :src="modelValue" alt="" />
      <span v-else class="content__media__upload__container"
        ><BaseIcon icon="canvas/panel/styles/media/upload"
      /></span>

      <span>filename.jpg</span>
    </div>
    <BaseIcon v-if="isLoading" class="loader" icon="loader" />
    <BaseIcon v-else-if="!modelValue" icon="canvas/panel/styles/media/upload" />
    <input
      type="file"
      class="hidden"
      ref="fileInputRef"
      @change="handleImageUpload"
      accept=".png, .jpg, .jpeg, .gif"
    />
  </div>
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
    const isHovered = ref(false);
    const isLoading = ref(false);

    onMounted(() => {
      fileInputRef.value = document.querySelector('input[type="file"]');
    });

    const handleUploadClick = () => {
      fileInputRef.value.click();
    };

    const handleMouseEnter = () => {
      isHovered.value = true;
    };

    const handleMouseLeave = () => {
      isHovered.value = false;
    };

    const handleImageUpload = async (event: any) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      const maxSizeMB = 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        store.dispatch("toast/showToast", {
          message: `File size exceeds ${maxSizeMB} MB`,
          type: "error",
        });
        event.target.value = "";
        return;
      }
      try {
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const base64Image = e.target.result;
          isLoading.value = true;
          try {
            await uploadToServer(base64Image);
          } catch (error) {
            store.dispatch("toast/showToast", {
              message: `Image failed to upload.`,
              type: "error",
            });
          } finally {
            isLoading.value = false;
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        isLoading.value = false;
      }
    };

    const uploadToServer = async (image: string) => {
      const res = await store.dispatch("canvas/uploadImageToCloudinary", {
        image,
        folder: "styles/images",
      });
      if (res.error || !res.url) return;
      emit("update:modelValue", res.url);
      emit("update", res.url);
    };

    return {
      activeIndex,
      isHovered,
      isLoading,
      handleMouseLeave,
      handleMouseEnter,
      handleUploadClick,
      handleImageUpload,
    };
  },
});
</script>

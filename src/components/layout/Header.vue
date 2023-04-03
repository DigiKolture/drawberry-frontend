<template>
  <header class="header">
    <div class="header__container">
      <div class="header__logo">
        <BaseIcon icon="logo/white" />
      </div>
      <!--      <div class="canvas-actions">-->
      <!--        <button class="btn btn-primary text-norm preview__action">-->
      <!--          <span>Login</span>-->
      <!--        </button>-->
      <!--        <button class="btn btn-success text-norm export__action">-->
      <!--          <span>Try app for free</span>-->
      <!--        </button>-->
      <!--      </div>-->
    </div>
  </header>
</template>

<script>
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon";
export default defineComponent({
  name: "HeaderComponent",
  components: { BaseIcon },
});
</script>

<style></style>

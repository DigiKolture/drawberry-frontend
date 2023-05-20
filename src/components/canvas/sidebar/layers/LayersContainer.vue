<template>
  <div class="layers__container">
    <div class="layers__component__items">
      <div class="layers__component__item">
        <div class="layers__component__item__header">
          <BaseIcon icon="canvas/sidebar/layers/dots" />
          <BaseIcon icon="canvas/sidebar/layers/open" />
          <BaseIcon icon="canvas/sidebar/layers/component" />
          <h5 class="layers__component__item__title">Component</h5>
        </div>

        <div class="layers__component__item__elements">
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/background" />
            <h5>Background</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/image" />
            <h5>Logo</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Menu</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Template</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Category</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Weekly Digest</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>What's New?</h5>
          </div>
        </div>
      </div>
      <div class="layers__component__item">
        <div class="layers__component__item__header">
          <BaseIcon icon="canvas/sidebar/layers/dots" />
          <BaseIcon icon="canvas/sidebar/layers/open" />
          <BaseIcon icon="canvas/sidebar/layers/component" />
          <h5 class="layers__component__item__title">Component</h5>
        </div>

        <div class="layers__component__item__elements">
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/background" />
            <h5>Background</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/image" />
            <h5>Logo</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Menu</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Template</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Category</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>Weekly Digest</h5>
          </div>
          <div class="layers__component__item__element">
            <BaseIcon icon="canvas/sidebar/layers/text" />
            <h5>What's New?</h5>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";

export default defineComponent({
  name: "LayersContainer",
  components: { BaseIcon },
});
</script>

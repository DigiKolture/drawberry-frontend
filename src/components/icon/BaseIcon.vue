<template>
  <svg
    :width="iconComponent.width"
    :height="iconComponent.height"
    :viewBox="iconComponent.viewBox"
    v-html="iconComponent.content"
  ></svg>
</template>

<!--<script lang="ts">-->
<script>
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "BaseIcon",
  props: {
    icon: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const icons = {};
    const requireComponents = require.context(
      "../../assets/images/icons/",
      true,
      /.svg$/
    );

    requireComponents.keys().forEach((fileName) => {
      const iconName = fileName.replace(/^\.\/icon-(.+)\.svg$/, "$1");
      const componentConfig = requireComponents(fileName);
      icons[iconName] = {
        width: componentConfig.data.width,
        height: componentConfig.data.height,
        viewBox: componentConfig.data.viewBox,
        content: componentConfig.data.data
          .replaceAll("_fill", "fill")
          .replaceAll("_stroke", "stroke")
          .replaceAll('pid="0"', ""),
      };
    });

    const iconComponent = computed(() => {
      return icons[`./${props.icon}.svg`];
    });

    return {
      iconComponent,
    };
  },
});
</script>

<style>
svg {
}

svg path {
}
</style>

<template>
  <div :class="{ active: isActive }" class="layers__component__item__element">
    <BaseIcon :icon="icon" />
    <h5>{{ title }}- {{ element.classes }}</h5>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import { layers } from "@/composables/canvas/layers";
import store from "@/store";

export default defineComponent({
  name: "LayersContainerElementItem",
  components: { BaseIcon },
  props: {
    element: {
      type: Object,
      required: true,
    },
    componentItem: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const {
      getLayerElementTitle,
      getLayerElementIcon,
      addHoverClassToElement,
      getComponentElementIndexUsingId,
      removeHoverClassFromElement,
    } = layers();

    const currentHoverElementId = ref("");

    const workspaceComponents = computed(() => {
      return store.getters["canvas/workspaceComponents"];
    });

    const title = getLayerElementTitle(props.element);
    const icon = getLayerElementIcon(props.element);

    const isActive = computed(() => {
      // console.log({ classes: props.element.classes });
      return (
        props.element.classes &&
        typeof props.element.classes == "object" &&
        props.element.classes.includes("hover")
      );
    });

    const handleMouseOver = async (event: any) => {
      // await removeAllHover();
      let componentItem = props.componentItem;
      let element = props.element;

      if (currentHoverElementId.value) {
        console.log({ currentHoverElementId: currentHoverElementId.value });
        const jsonIndex = getComponentElementIndexUsingId(
          componentItem,
          currentHoverElementId.value
        );

        if (jsonIndex > -1) {
          console.log({ jsonIndex });
          console.log({
            oldElementClasses: componentItem.json[jsonIndex],
          });
          const newElementClasses = removeHoverClassFromElement(
            componentItem.json[jsonIndex]
          );
          // eslint-disable-next-line vue/no-mutating-props
          props.componentItem.json[jsonIndex].classes =
            newElementClasses.classes;

          console.log({
            newElement: componentItem.json[jsonIndex],
            newElementClasses: newElementClasses.classes,
          });
          // html = updateElementDom(html, element, true);
          // eslint-disable-next-line vue/no-mutating-props
          props.componentItem.json = componentItem.json;
          console.log({
            json: componentItem.json,
          });
        }
      }

      currentHoverElementId.value = element.id;
      element.classes = addHoverClassToElement(element).classes;
    };

    const removeAllHover = async () => {
      for (let workspaceComponent of workspaceComponents.value) {
        for (let element of workspaceComponent.json) {
          element.classes =
            element.classes &&
            typeof element.classes === "object" &&
            element.classes.includes("hover")
              ? element.classes.filter((classs: string) => classs !== "hover")
              : element.classes;
        }
      }
    };

    return {
      title,
      icon,
      isActive,
      handleMouseOver,
    };
  },
});
</script>

<template>
  <div class="layers__component__item">
    <div class="layers__component__item__header">
      <BaseIcon icon="canvas/sidebar/layers/dots" />
      <BaseIcon icon="canvas/sidebar/layers/open" />
      <BaseIcon icon="canvas/sidebar/layers/component" />
      <h5 class="layers__component__item__title">Component</h5>
    </div>

    <div class="layers__component__item__elements">
      <LayersContainerElementItem
        v-for="element in component.json"
        :key="element.id"
        @mouseover="handleMouseOver(element)"
        :element="element"
        :componentItem="component"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BaseIcon from "@/components/icon/BaseIcon.vue";
import LayersContainerElementItem from "@/components/canvas/sidebar/layers/LayersContainerElementItem.vue";
import { layers } from "@/composables/canvas/layers";
import { updateDom } from "@/composables/canvas/update_dom";
import store from "@/store";

export default defineComponent({
  name: "LayersContainerItem",
  components: { LayersContainerElementItem, BaseIcon },
  props: {
    component: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const {
      addHoverClassToElement,
      getComponentElementIndexUsingId,
      removeHoverClassFromElement,
    } = layers();

    const { updateElementDom } = updateDom();

    // const currentHoverElementId = ref("");
    const currentHoverElementId = computed(() => {
      return store.getters["canvas/currentHoverElementId"];
    });

    const currentHoverElement = computed(() => {
      return store.getters["canvas/currentHoverElement"];
    });

    const handleMouseOver = async (element: any) => {
      let componentItem = props.component;
      if (currentHoverElement.value.id) {
        const jsonIndex = getComponentElementIndexUsingId(
          componentItem,
          currentHoverElement.value.id
        );

        if (jsonIndex > -1) {
          const newElementClasses = removeHoverClassFromElement(
            componentItem.json[jsonIndex]
          );
          // eslint-disable-next-line vue/no-mutating-props
          props.component.json[jsonIndex].classes = newElementClasses.classes;
          // eslint-disable-next-line vue/no-mutating-props
          props.component.html = updateElementDom(
            props.component.html,
            props.component.json[jsonIndex],
            true
          );
        }
      }
      //
      // currentHoverElementId.value = element.id;
      store.commit("canvas/SET_CURRENT_HOVER_ELEMENT_ID", element.id);
      element.classes = addHoverClassToElement(element).classes;
      // eslint-disable-next-line vue/no-mutating-props
      props.component.html = updateElementDom(props.component.html, element);
    };

    return { handleMouseOver };
  },
});
</script>

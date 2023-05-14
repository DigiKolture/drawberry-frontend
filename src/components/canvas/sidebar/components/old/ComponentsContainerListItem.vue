<template>
  <li class="component__list-item">
    <a
      @click="fetchComponentItems(component)"
      class="component__list-link"
      :class="{
        active: selectedComponent && selectedComponent.id === component.id,
      }"
      href="#"
      >{{ component.name }}</a
    >
  </li>
</template>
<script>
import { defineComponent, ref } from "vue";
import store from "@/store";
import { ui } from "@/assets/js/canvas";

export default defineComponent({
  name: "ComponentsContainerListItem",
  props: {
    component: {
      type: Object,
      required: true,
    },
  },

  setup() {
    const selectedComponent = ref(() => {
      return store.getters["components/selectedComponent"];
    });

    const fetchComponentItems = (component) => {
      ui.changeComponentItemsStatus();
      selectedComponent.value = component;
      store.commit("components/SET_SELECTED_COMPONENT", selectedComponent);
      store.dispatch("components/getComponentItems", component.id);
    };

    return {
      selectedComponent,
      fetchComponentItems,
    };
  },
});
</script>

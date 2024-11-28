<template>
  <li class="component__list-item">
    <a
      @click="fetchComponentItems(component)"
      class="component__list-link"
      :class="{
        active: selectedComponent && selectedComponent.id === component.id,
      }"
    >
      {{ component.name }}
    </a>
  </li>
</template>
<script>
import { computed, defineComponent, onMounted, ref } from "vue";
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
    const selectedComponent = computed(() => {
      return store.getters["components/selectedComponent"];
    });

    onMounted(() => {
      store.commit("components/SET_SELECTED_COMPONENT", null);
    });

    const fetchComponentItems = (component) => {
      // if (component.id === selectedComponent.value?.id) {
      //   return;
      // }
      ui.changeComponentItemsStatus();
      const modalContent = document.getElementById("component-items");
      if (modalContent) {
        // Scroll to the top of the component items modal if the selected component changes
        modalContent.scrollTo({ top: 0, behavior: "smooth" });
      }
      store.commit("components/SET_SELECTED_COMPONENT", component);
      store.commit("components/SET_COMPONENT_ITEMS", component.items);
    };

    return {
      selectedComponent,
      fetchComponentItems,
    };
  },
});
</script>

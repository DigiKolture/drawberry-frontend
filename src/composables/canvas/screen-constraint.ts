import { onMounted, onUnmounted, ref } from "vue";

export function screenConstraint() {
  const isSmallScreen = ref(window.innerWidth < 900);

  const checkScreenSize = () => {
    isSmallScreen.value = window.innerWidth < 900;
  };

  onMounted(() => {
    window.addEventListener("resize", checkScreenSize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkScreenSize);
  });

  return {
    isSmallScreen,
  };
}

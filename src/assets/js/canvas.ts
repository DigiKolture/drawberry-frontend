export const ui = {
  mainIndex(): void {
    // this.closeComponentItemsWhenWorkspaceIsClicked();
  },

  changeComponentItemsStatus(show = true): void {
    const componentItems = document.getElementById("component-items");
    if (componentItems) {
      if (show) {
        if (componentItems.classList.contains("hide")) {
          componentItems.classList.remove("hide");
        }
      } else {
        if (!componentItems.classList.contains("hide")) {
          componentItems.classList.add("hide");
        }
      }
    }
  },

  closeComponentItemsWhenWorkspaceIsClicked(): void {
    const workspace = document.getElementById("canvas-workspace");

    workspace?.addEventListener("click", () => {
      this.changeComponentItemsStatus(false);
    });
  },
};

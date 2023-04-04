export const ui = {
  mainIndex(): void {
    this.closeComponentItemsWhenWorkspaceIsClicked();
  },

  changeComponentItemsStatus(show = true): void {
    const componentItems = document.getElementById("component-items");
    if (componentItems) {
      if (show) {
        componentItems.classList.remove("hide");
      } else {
        componentItems.classList.add("hide");
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

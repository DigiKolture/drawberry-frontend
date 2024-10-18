export function scroll() {
  const inView = (element: any) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };
  const scrollTo = (selector: string) => {
    const element = document.querySelector(selector);

    if (element) {
      const inV = inView(element);
      if (!inV) {
        element.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    }
  };

  return {
    scrollTo,
  };
}

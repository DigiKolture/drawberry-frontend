export function styles() {
  const parsePadding = (padding: string) => {
    const values = padding.split(" ").map((value) => value.replace("px", ""));
    switch (values.length) {
      case 1:
        return {
          top: values[0],
          left: values[0],
          right: values[0],
          bottom: values[0],
        };
      case 2:
        return {
          top: values[0],
          left: values[1],
          right: values[1],
          bottom: values[0],
        };
      case 3:
        return {
          top: values[0],
          left: values[1],
          right: values[1],
          bottom: values[2],
        };
      case 4:
        return {
          top: values[0],
          left: values[3],
          right: values[1],
          bottom: values[2],
        };
      default:
        throw new Error("Invalid padding value");
    }
  };

  const getDefaultPaddingValue = (padding: any) => {
    const { top, left, right, bottom } = padding;
    return top === left && left === right && right === bottom ? right : 0;
  };

  const getDefaultPaddingPosition = (padding: any) => {
    const { top, left, right, bottom } = padding;
    return top === left && left === right && right === bottom
      ? "center"
      : "left";
  };

  return {
    parsePadding,
    getDefaultPaddingValue,
    getDefaultPaddingPosition,
  };
}

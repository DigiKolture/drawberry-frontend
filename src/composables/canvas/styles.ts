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

  const rgbaToHex = (color: string): string => {
    if (/^rgb/.test(color)) {
      const rgba = color.replace(/^rgba?\(|\s+|\)$/g, "").split(",");

      // rgb to hex
      // eslint-disable-next-line no-bitwise
      let hex = `#${(
        (1 << 24) +
        (parseInt(rgba[0], 10) << 16) +
        (parseInt(rgba[1], 10) << 8) +
        parseInt(rgba[2], 10)
      )
        .toString(16)
        .slice(1)}`;

      // added alpha param if exists
      if (rgba[4]) {
        const alpha = Math.round(0o1 * 255);
        const hexAlpha = (alpha + 0x10000)
          .toString(16)
          .substr(-2)
          .toUpperCase();
        hex += hexAlpha;
      }

      return hex;
    }
    return color;
  };

  const rgbaToHex8 = (color: string) => {
    if (!color.startsWith("rgba(")) {
      return color;
    }
    // Parse the RGBA components
    const match = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)$/i
    );
    if (!match) {
      throw new Error("Invalid RGBA color string");
    }

    // eslint-disable-next-line prefer-const
    let [r, g, b, a] = match.slice(1);
    a =
      a === undefined
        ? "FF"
        : Math.round(parseFloat(a) * 255)
            .toString(16)
            .padStart(2, "0");

    // Convert to HEX8
    const hex = (
      (1 << 24) +
      (parseInt(r) << 16) +
      (parseInt(g) << 8) +
      parseInt(b)
    )
      .toString(16)
      .slice(1);
    return `#${hex}${a}`.toUpperCase();
  };

  const parseBoxShadow = (shadow: string) => {
    const regexp = /[^\s(]+(\(.+\))?/g;
    let values: any = shadow.match(regexp);
    if (values === null) {
      return {
        y: 0,
        x: 0,
        blur: 0,
        spread: 0,
        color: "#fffff",
      };
    }
    values = values.map((value: string) => value.replace("px", ""));
    return {
      y: values[0],
      x: values[1],
      blur: values[2],
      spread: values[3],
      color: {
        hex8: rgbaToHex8(values[4]),
      },
    };
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
    parseBoxShadow,
    getDefaultPaddingPosition,
  };
}

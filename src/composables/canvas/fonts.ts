import { computed } from "vue";
import store from "@/store";

export function fonts() {
  const googleFonts = computed(() => {
    return store.getters["canvas/googleFonts"];
  });

  const extractFirstFontFamily = (fontStack: string) => {
    const regex = /['"]?([^'",]+)['"]?,?/; // Regex pattern to match the first font family name
    const match = fontStack.match(regex);
    if (match) {
      return match[1]; // Extracted font family name
    }
    return null; // No font family name found
  };

  const getFont = (family: string | null) => {
    if (!family) return null;
    return googleFonts.value.find((font: any) => font.family === family);
  };

  const getFullFamily = (family: string) => {
    const googleFont = googleFonts.value.find(
      (font: any) => font.family === family
    );
    return googleFont ? `'${family}', ${googleFont.category}` : null;
  };

  const getFontWeights = (variants: string[]) => {
    const validWeights: number[] = variants.map((weight: string) => {
      if (weight === "regular") {
        return 400;
      }
      return parseInt(weight.replace(/\D/g, ""), 10);
    });
    const uniqueWeights = Array.from(new Set(validWeights));
    return uniqueWeights.filter((weight) => !isNaN(weight));
  };

  const getFontWeightsWithFamily = (family: string) => {
    const font = getFont(extractFirstFontFamily(family));
    return getFontWeights(font.variants);
  };

  return {
    extractFirstFontFamily,
    getFont,
    getFullFamily,
    getFontWeightsWithFamily,
    getFontWeights,
  };
}

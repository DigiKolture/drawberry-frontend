import { ProjectStyle } from "@/store/modules/canvas/types";

// The Source hash is a fingerprint of a design's *inputs* (each component's json + the
// project style), stored alongside the Compiled email HTML. The backend recomputes it the
// same way to tell whether the stored HTML is still current: a mismatch (or a missing
// hash) means "stale — recompile" rather than serving out-of-date HTML (ADR-0005).
//
// This algorithm is a cross-repo contract: drawberry-backend/src/common/utils/
// source-hash.util.ts MUST compute byte-identical input, or every export would look stale.
// Keep the two in lockstep. The inputs hashed here are exactly the arrays uploaded on
// save (the removeClasses'd json + the project style), which is what the backend persists.

/** The style fields that define a design, in a fixed order, missing normalized to "". */
const styleFingerprint = (style: ProjectStyle): Record<string, string> => ({
  layout: style?.layout ?? "",
  backgroundColor: style?.backgroundColor ?? "",
  fontFamily: style?.fontFamily ?? "",
  buttonColor: style?.buttonColor ?? "",
  backgroundImage: style?.backgroundImage ?? "",
  previewText: style?.previewText ?? "",
});

/** Deterministic JSON: object keys sorted recursively so key order can't shift the hash. */
export const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const entries = keys.map(
    (key) =>
      `${JSON.stringify(key)}:${stableStringify(
        (value as Record<string, unknown>)[key]
      )}`
  );
  return `{${entries.join(",")}}`;
};

/** The exact string both repos hash. Exported so tests can assert parity directly. */
export const sourceHashInput = (
  componentsJson: object[][],
  style: ProjectStyle
): string =>
  stableStringify({
    components: componentsJson,
    style: styleFingerprint(style),
  });

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

/**
 * SHA-256 (hex) of the design inputs. Async because it uses the browser's Web Crypto —
 * compile already runs async (it measures the DOM), so this adds no friction.
 */
export const computeSourceHash = async (
  componentsJson: object[][],
  style: ProjectStyle
): Promise<string> => {
  const input = sourceHashInput(componentsJson, style);
  const bytes = new TextEncoder().encode(input);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return toHex(digest);
};

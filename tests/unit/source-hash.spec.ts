import {
  sourceHashInput,
  stableStringify,
} from "@/composables/canvas/compile/source-hash";
import { ProjectStyle } from "@/store/modules/canvas/types";

// The Source hash is a cross-repo contract: the backend recomputes it to detect stale
// compiled HTML, so the exact bytes hashed here MUST match
// drawberry-backend/src/common/utils/source-hash.util.ts. This golden string is asserted
// verbatim in BOTH repos (see compiled-email.service.test.ts) — if either drifts, one
// side breaks and every export looks stale. computeSourceHash itself needs a browser
// (Web Crypto), so we pin the pre-hash input string, which is what actually has to agree.

const STYLE: ProjectStyle = {
  layout: "collapsed",
  backgroundColor: "#FFF",
  fontFamily: "DM Sans",
  buttonColor: "",
  backgroundImage: "",
  previewText: "",
};

const GOLDEN =
  '{"components":[[{"id":"a","textContent":"hi"}]],' +
  '"style":{"backgroundColor":"#FFF","backgroundImage":"","buttonColor":"",' +
  '"fontFamily":"DM Sans","layout":"collapsed","previewText":""}}';

describe("source-hash input (cross-repo contract)", () => {
  it("produces the agreed golden input string", () => {
    expect(sourceHashInput([[{ id: "a", textContent: "hi" }]], STYLE)).toBe(
      GOLDEN
    );
  });

  it("sorts object keys recursively so key order can't shift the hash", () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } })).toBe(
      '{"a":{"c":3,"d":2},"b":1}'
    );
  });

  it("preserves array order (arrays are ordered, not sorted)", () => {
    expect(stableStringify([3, 1, 2])).toBe("[3,1,2]");
  });

  it("normalizes missing style fields to empty strings", () => {
    const input = sourceHashInput([], {} as ProjectStyle);
    expect(input).toContain('"backgroundColor":""');
    expect(input).toContain('"previewText":""');
  });
});

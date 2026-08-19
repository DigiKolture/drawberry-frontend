import { ProjectStyle } from "@/store/modules/canvas/types";
import { projectHtml } from "@/composables/project/html";
import { emit, collectColorOverrides, collectMediaQuery } from "./emit";
import { measureCanvas, measureMobile } from "./measure";
import { computeSourceHash } from "./source-hash";

// The compile orchestrator threads the whole spine: measure the rendered Canvas -> emit
// tables -> wrap in Chrome, and fingerprint the design inputs. The frontend is the sole
// producer of the Compiled email HTML (ADR-0005); this is what the save flow uploads so
// the backend can store and serve it.

export interface CompileResult {
  /** The finished, table-based email — what export/download/preview serve. */
  compiledHtml: string;
  /** Fingerprint of the design inputs, so the backend can detect staleness. */
  sourceHash: string;
}

export function compile() {
  const { wrapInChrome } = projectHtml();

  /**
   * Compile the currently-rendered Canvas. Returns null when the Canvas isn't mounted to
   * measure (e.g. save triggered off-Canvas) — the caller then skips uploading compiled
   * HTML, which the backend treats as "needs recompile" rather than serving stale output.
   *
   * @param componentsJson the per-component json arrays being saved (removeClasses'd), so
   *   the Source hash fingerprints exactly what is persisted.
   * @param style the project style being saved.
   */
  const compileCanvas = async (
    componentsJson: object[][],
    style: ProjectStyle
  ): Promise<CompileResult | null> => {
    const desktop = measureCanvas();
    if (!desktop) return null;
    // Measure a hidden mobile-width render too, so the mobile restacking is observed
    // (ADR-0004). If it can't be measured, we still ship a correct desktop-only email.
    const mobile = measureMobile() || undefined;

    const body = emit(desktop, mobile);
    const headCss = [
      collectMediaQuery(desktop, mobile),
      collectColorOverrides(desktop),
    ]
      .filter(Boolean)
      .join("\n");
    const compiledHtml = wrapInChrome(body, style, headCss);
    const sourceHash = await computeSourceHash(componentsJson, style);
    return { compiledHtml, sourceHash };
  };

  return { compileCanvas };
}

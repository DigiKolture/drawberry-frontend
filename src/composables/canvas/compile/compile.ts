import { nextTick } from "vue";
import store from "@/store";
import { ProjectStyle } from "@/store/modules/canvas/types";
import { CanvasBreakpoints } from "@/store/modules/canvas/types";
import { projectHtml } from "@/composables/project/html";
import { emit, collectColorOverrides, collectMediaQuery } from "./emit";
import { measureCanvas, CANVAS_ROOT_ID } from "./measure";
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

/**
 * Switch the Canvas breakpoint and wait for the DOM to reflect it. Each rendered component
 * watches the `breakpoint` getter and rebuilds its `v-html` from the per-breakpoint style
 * values in its json (see WorkspaceComponentItemsListItem). `nextTick` is a *microtask*, so
 * awaiting it flushes Vue's render + DOM patch WITHOUT yielding a paint frame — the browser
 * never shows an intermediate breakpoint, so the toggle-and-measure below stays invisible.
 * Two ticks: the breakpoint watcher mutates a reactive prop (`html`) mid-flush, so a second
 * cycle patches that mutation in; both are microtasks, so still no paint.
 */
const settleBreakpoint = async (bp: CanvasBreakpoints): Promise<void> => {
  store.commit("canvas/SET_BREAKPOINT", bp);
  await nextTick();
  await nextTick();
};

export function compile() {
  const { wrapInChrome } = projectHtml();

  /**
   * Compile the currently-rendered Canvas. Returns null when the Canvas isn't mounted to
   * measure (e.g. save triggered off-Canvas) — the caller then skips uploading compiled
   * HTML, which the backend treats as "needs recompile" rather than serving stale output.
   *
   * Desktop and mobile geometry are BOTH observed (ADR-0004) by driving the Canvas through
   * its real breakpoints: force desktop -> measure, force mobile -> measure, then restore the
   * user's breakpoint. This decouples the compile from whatever breakpoint the Canvas happens
   * to be showing (so a compile taken while viewing Mobile no longer bakes a mobile "desktop"
   * layout), and captures the design's true mobile restacking — which lives in the json's
   * per-breakpoint styles, not in the desktop DOM — because the mobile measurement reads the
   * Canvas as the mobile breakpoint actually renders it.
   *
   * @param componentsJson the per-component json arrays being saved (removeClasses'd), so
   *   the Source hash fingerprints exactly what is persisted.
   * @param style the project style being saved.
   */
  const compileCanvas = async (
    componentsJson: object[][],
    style: ProjectStyle
  ): Promise<CompileResult | null> => {
    // Nothing to measure if the Canvas isn't mounted — bail before touching breakpoint state.
    if (!document.getElementById(CANVAS_ROOT_ID)) return null;

    const original = store.getters["canvas/breakpoint"] as CanvasBreakpoints;
    let desktop = null;
    let mobile = null;
    try {
      await settleBreakpoint(CanvasBreakpoints.DESKTOP);
      desktop = measureCanvas();
      await settleBreakpoint(CanvasBreakpoints.MOBILE);
      mobile = measureCanvas();
    } finally {
      // Always put the Canvas back the way the user had it, even if measuring threw.
      await settleBreakpoint(original);
    }
    if (!desktop) return null;

    const body = emit(desktop, mobile || undefined);
    const headCss = [
      collectMediaQuery(desktop, mobile || undefined),
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

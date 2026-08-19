import {
  MeasuredNode,
  MeasuredRole,
  MeasuredStyles,
  MeasuredTree,
} from "./measured-tree";

// Measurement: the thin, browser-bound half of the compile pipeline. It reads the *real*
// rendered geometry of the Canvas (getBoundingClientRect) plus a curated set of computed
// styles, and hands the emitter a plain MeasuredTree. It deliberately holds no layout
// logic of its own — "what does this layout actually do" is answered by the browser, and
// the emitter only transcribes the answer (ADR-0004). Because jsdom has no layout engine,
// this module is exercised by the geometric golden-diff (Seam 2, later), not unit tests;
// the emitter is the unit-tested seam.

/** The DOM id of the container wrapping every rendered component on the Canvas. */
export const CANVAS_ROOT_ID = "canvas-workspace-items-container";

const isVisible = (el: Element, style: CSSStyleDeclaration): boolean => {
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const readStyles = (style: CSSStyleDeclaration): MeasuredStyles => ({
  backgroundColor: normalizeColor(style.backgroundColor),
  color: style.color || undefined,
  fontFamily: style.fontFamily || undefined,
  fontSize: style.fontSize || undefined,
  fontWeight: style.fontWeight || undefined,
  lineHeight: style.lineHeight || undefined,
  textAlign: style.textAlign || undefined,
  borderRadius: normalizeZero(style.borderRadius),
  paddingTop: normalizeZero(style.paddingTop),
  paddingRight: normalizeZero(style.paddingRight),
  paddingBottom: normalizeZero(style.paddingBottom),
  paddingLeft: normalizeZero(style.paddingLeft),
});

/** Drop fully-transparent backgrounds so the emitter doesn't bake a meaningless colour. */
const normalizeColor = (value: string): string | undefined => {
  if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") {
    return undefined;
  }
  return value;
};

const normalizeZero = (value: string): string | undefined =>
  !value || value === "0px" ? undefined : value;

const hasElementChildren = (el: Element): boolean =>
  Array.from(el.children).some((child) => child.nodeType === 1);

/** Classify a rendered element for emission from its tag and measured styles. */
const roleOf = (el: Element, style: CSSStyleDeclaration): MeasuredRole => {
  const tag = el.tagName.toLowerCase();
  if (tag === "img") return "image";
  // A link with a solid background reads as a button (its measured colour/padding/radius
  // become the bulletproof button in later tickets). A bare link stays text.
  if (tag === "a" && normalizeColor(style.backgroundColor)) return "button";
  return hasElementChildren(el) ? "container" : "text";
};

const measureElement = (
  el: Element,
  rootLeft: number,
  rootTop: number
): MeasuredNode | null => {
  const style = window.getComputedStyle(el);
  if (!isVisible(el, style)) return null;

  const rect = el.getBoundingClientRect();
  const role = roleOf(el, style);
  const node: MeasuredNode = {
    id: el.id || "",
    role,
    rect: {
      x: rect.left - rootLeft,
      y: rect.top - rootTop,
      width: rect.width,
      height: rect.height,
    },
    styles: readStyles(style),
    children: [],
  };

  if (role === "image") {
    node.src = el.getAttribute("src") || "";
    node.alt = el.getAttribute("alt") || "";
  } else if (role === "button") {
    node.href = el.getAttribute("href") || "";
    node.text = (el.textContent || "").trim();
  } else if (role === "text") {
    node.text = (el.textContent || "").trim();
  } else {
    for (const child of Array.from(el.children)) {
      const measured = measureElement(child, rootLeft, rootTop);
      if (measured) node.children.push(measured);
    }
    // A container that measured no visible children is nothing to emit.
    if (node.children.length === 0) return null;
  }

  return node;
};

/**
 * Measure the rendered Canvas into a MeasuredTree. Returns null when the Canvas isn't
 * mounted (e.g. compile requested off-Canvas) — callers treat that as "can't compile now"
 * and simply skip uploading, which the backend reads as "needs recompile".
 */
export const measureCanvas = (
  doc: Document = document
): MeasuredTree | null => {
  const rootEl = doc.getElementById(CANVAS_ROOT_ID);
  if (!rootEl) return null;

  const rootRect = rootEl.getBoundingClientRect();
  const children: MeasuredNode[] = [];
  for (const child of Array.from(rootEl.children)) {
    const measured = measureElement(child, rootRect.left, rootRect.top);
    if (measured) children.push(measured);
  }
  if (children.length === 0) return null;

  const root: MeasuredNode = {
    id: CANVAS_ROOT_ID,
    role: "root",
    rect: { x: 0, y: 0, width: rootRect.width, height: rootRect.height },
    styles: {},
    children,
  };
  return { contentWidth: Math.round(rootRect.width), root };
};

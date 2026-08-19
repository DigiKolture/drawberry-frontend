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

/**
 * The link that makes an element a button: the element itself when it is a link, or a
 * single wrapped link whose label is the wrapper's only content. In the catalog a button is
 * a `<div>` carrying the background/radius/padding around one `<a>` label (not an image),
 * so the coloured wrapper — not the transparent `<a>` — is what to detect.
 */
const buttonLink = (el: Element): Element | null => {
  if (el.tagName.toLowerCase() === "a") return el;
  const anchors = el.querySelectorAll("a");
  if (anchors.length !== 1) return null;
  const anchor = anchors[0];
  if (anchor.querySelector("img")) return null; // an image link, not a text button
  return (el.textContent || "").trim() === (anchor.textContent || "").trim()
    ? anchor
    : null;
};

/** Classify a rendered element for emission from its tag and measured styles. */
const roleOf = (el: Element, style: CSSStyleDeclaration): MeasuredRole => {
  const tag = el.tagName.toLowerCase();
  if (tag === "img") return "image";
  // A solid background wrapped around a single link is a button — its measured
  // dimensions/colour/radius drive the bulletproof VML button. A bare link stays text
  // (below) so it keeps its href.
  if (normalizeColor(style.backgroundColor) && buttonLink(el)) return "button";
  if (hasElementChildren(el)) return "container";
  // A childless element with no text is a visual block (divider, colour bar, spacer): keep
  // its measured height + background rather than collapsing it to an empty text node.
  return (el.textContent || "").trim() === "" ? "box" : "text";
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
    const link = buttonLink(el) as Element;
    node.href = link.getAttribute("href") || "";
    node.text = (el.textContent || "").trim();
    // The wrapper carries the button's box + background/radius/padding (already read into
    // node.styles); the inner link carries the label's colour/font. Pull those from the
    // link so the button text renders as designed.
    if (link !== el) {
      const linkStyle = window.getComputedStyle(link);
      node.styles.color = linkStyle.color || node.styles.color;
      node.styles.fontFamily = linkStyle.fontFamily || node.styles.fontFamily;
      node.styles.fontSize = linkStyle.fontSize || node.styles.fontSize;
      node.styles.fontWeight = linkStyle.fontWeight || node.styles.fontWeight;
    }
  } else if (role === "text") {
    node.text = (el.textContent || "").trim();
    // A bare link leaf keeps its href so the emitter renders it as an anchor.
    if (el.tagName.toLowerCase() === "a") {
      node.href = el.getAttribute("href") || "";
    }
  } else if (role === "box") {
    // Nothing to read beyond the rect + background already captured — it's a bare block.
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

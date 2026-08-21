import { MeasuredNode, MeasuredStyles, MeasuredTree } from "./measured-tree";

// The emitter: a pure `MeasuredTree -> Compiled email body` function. It transcribes
// measured geometry into email-safe nested tables — it never guesses layout from CSS
// rules (ADR-0004). Everything here is derived from the numbers measurement observed:
//   - column widths  = measured element widths
//   - row grouping   = children bucketed by measured vertical overlap
//   - alignment      = derived from a child's measured x-offset within its parent
//   - gaps           = measured pixel distance between boxes
// Buttons are emitted as bulletproof VML (Outlook rounded-rect + a styled <a> fallback)
// from their measured dimensions, and colours are forced light (off-white/off-black, no
// dark @media — ADR-0006). Given a mobile MeasuredTree, each section that reflows on mobile
// is emitted as two layouts — desktop tables and mobile tables (from the mobile measurement)
// — toggled by a measured @media block (see collectMediaQuery).
// This function stays browser-free so it can be unit-tested against synthetic fixtures.

/** Boxes within this many px of each other vertically count as the same row. */
const ROW_TOLERANCE = 4;
/** Left/right gaps within this many px of each other count as centered. */
const ALIGN_TOLERANCE = 4;

// Force light (ADR-0006): pure #FFFFFF / #000000 trip dark-mode inversion heuristics, so we
// bake imperceptibly-off values that dodge them while looking identical to the design.
const OFF_WHITE = "#fffffe";
const OFF_BLACK = "#010101";

/** Nudge a pure-white / pure-black colour off the values dark mode loves to invert. */
const forceLightColor = (value?: string): string | undefined => {
  if (!value) return value;
  const v = value.trim().toLowerCase().replace(/\s+/g, "");
  if (
    v === "#ffffff" ||
    v === "#fff" ||
    v === "white" ||
    v === "rgb(255,255,255)"
  ) {
    return OFF_WHITE;
  }
  if (v === "#000000" || v === "#000" || v === "black" || v === "rgb(0,0,0)") {
    return OFF_BLACK;
  }
  return value;
};

/**
 * Convert an `rgb()/rgba()` colour to `#rrggbb`. Word's VML engine (Outlook) doesn't
 * reliably parse functional `rgb()` in fillcolor/strokecolor and falls back to black, so
 * VML attributes must be hex; hex/named colours pass through unchanged.
 */
const rgbToHex = (color?: string): string | undefined => {
  if (!color) return color;
  const match = color.match(/^rgba?\(([^)]+)\)/i);
  if (!match) return color;
  const [r, g, b] = match[1].split(",").map((n) => parseInt(n.trim(), 10));
  const hex = (n: number): string =>
    Math.max(0, Math.min(255, n || 0))
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

const round = (n: number): number => Math.round(n);

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttr = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/**
 * Build an inline style string from ordered [prop, value] pairs, skipping empties. Measured
 * CSS values can contain double quotes (font-family: "DM Sans", …); since the result is
 * placed in a double-quoted style="…" attribute, those quotes are normalized to single
 * quotes so they don't terminate the attribute and drop the whole declaration. Single quotes
 * are valid CSS and safe in every email client.
 */
const styleString = (pairs: Array<[string, string | undefined]>): string =>
  pairs
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([prop, value]) => `${prop}: ${value};`)
    .join(" ")
    .replace(/"/g, "'");

const fontStylePairs = (
  styles: MeasuredStyles
): Array<[string, string | undefined]> => [
  ["font-family", styles.fontFamily],
  ["font-size", styles.fontSize],
  ["font-weight", styles.fontWeight],
  ["line-height", styles.lineHeight],
  ["color", forceLightColor(styles.color)],
  ["text-align", styles.textAlign],
];

const fontStyle = (styles: MeasuredStyles): string =>
  styleString(fontStylePairs(styles));

const buttonStyle = (styles: MeasuredStyles): string =>
  styleString([
    ["display", "inline-block"],
    ["background-color", forceLightColor(styles.backgroundColor)],
    ["color", forceLightColor(styles.color)],
    ["border-radius", styles.borderRadius],
    ["font-family", styles.fontFamily],
    ["font-size", styles.fontSize],
    ["font-weight", styles.fontWeight],
    ["padding-top", styles.paddingTop],
    ["padding-right", styles.paddingRight],
    ["padding-bottom", styles.paddingBottom],
    ["padding-left", styles.paddingLeft],
    ["text-decoration", "none"],
  ]);

/** Percentage of the button's height that the measured corner radius represents (VML arcsize). */
const arcsize = (styles: MeasuredStyles, height: number): string => {
  const radius = parseFloat(styles.borderRadius || "0");
  if (!radius || !height) return "0%";
  return `${Math.min(50, Math.round((radius / height) * 100))}%`;
};

// A bulletproof VML button: an Outlook-only rounded rectangle sized to the measured button,
// plus a styled <a> every other client uses. Both carry the measured width/padding/radius/
// colour, so the button looks the same and stays clickable everywhere (spec User Story 10).
const emitButton = (node: MeasuredNode): string => {
  const href = node.href ? escapeAttr(node.href) : "";
  const text = escapeHtml(node.text || "");
  const width = round(node.rect.width);
  const height = round(node.rect.height);
  // VML wants hex (rgb() falls back to black in Outlook); the CSS fallback keeps rgb().
  const fill =
    rgbToHex(forceLightColor(node.styles.backgroundColor)) || OFF_BLACK;
  const textColor = rgbToHex(forceLightColor(node.styles.color)) || OFF_WHITE;
  const centerStyle = styleString([
    ["color", textColor],
    ["font-family", node.styles.fontFamily],
    ["font-size", node.styles.fontSize],
    ["font-weight", node.styles.fontWeight],
  ]);
  const vml =
    `<!--[if mso]>` +
    `<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"` +
    ` xmlns:w="urn:schemas-microsoft-com:office:word"` +
    (href ? ` href="${href}"` : "") +
    ` style="height:${height}px;v-text-anchor:middle;width:${width}px;"` +
    ` arcsize="${arcsize(
      node.styles,
      height
    )}" strokecolor="${fill}" fillcolor="${fill}">` +
    `<w:anchorlock/><center style="${centerStyle}">${text}</center>` +
    `</v:roundrect><![endif]-->`;
  const fallback =
    `<!--[if !mso]><!-->` +
    `<a${idAttr(node.id)}${href ? ` href="${href}"` : ""} style="${buttonStyle(
      node.styles
    )}">${text}</a>` +
    `<!--<![endif]-->`;
  return vml + fallback;
};

const idAttr = (id: string): string => (id ? ` id="${escapeAttr(id)}"` : "");

/** Emit a leaf node (text / image / button) as cell content. */
const emitLeaf = (node: MeasuredNode): string => {
  switch (node.role) {
    case "image": {
      // max-width:100% lets the image shrink with a narrow (non-Outlook) client.
      const style = styleString([
        ["display", "block"],
        ["max-width", "100%"],
      ]);
      return (
        `<img${idAttr(node.id)} src="${escapeAttr(node.src || "")}"` +
        ` width="${round(node.rect.width)}" height="${round(
          node.rect.height
        )}"` +
        ` alt="${escapeAttr(node.alt || "")}" style="${style}" />`
      );
    }
    case "button":
      return emitButton(node);
    case "box": {
      // A bare visual block: hold its measured height and background so it doesn't collapse.
      const style = styleString([
        ["height", `${round(node.rect.height)}px`],
        ["line-height", `${round(node.rect.height)}px`],
        ["font-size", "1px"],
        ["background-color", forceLightColor(node.styles.backgroundColor)],
        ["border-radius", node.styles.borderRadius],
      ]);
      return `<div${idAttr(node.id)} style="${style}">&nbsp;</div>`;
    }
    case "text":
    default: {
      const style = fontStyle(node.styles);
      const content = escapeHtml(node.text || "");
      // A text leaf that is itself a link keeps its href (e.g. footer "Unsubscribe", header
      // nav links) rather than being flattened to inert text. Links underline by default, so
      // reproduce the Canvas's measured text-decoration (usually "none") to avoid an
      // unwanted underline.
      if (node.href) {
        const linkStyle = styleString([
          ...fontStylePairs(node.styles),
          ["text-decoration", node.styles.textDecoration || "none"],
        ]);
        return `<a${idAttr(node.id)} href="${escapeAttr(
          node.href
        )}" style="${linkStyle}">${content}</a>`;
      }
      const styleAttr = style ? ` style="${style}"` : "";
      return `<div${idAttr(node.id)}${styleAttr}>${content}</div>`;
    }
  }
};

/**
 * A function that renders one measured node to HTML. It's threaded through
 * emitContainer/emitRow so the same layout code can emit either a plain single layout or
 * the responsive (desktop + mobile) variant, depending on which emitter is passed.
 */
type ChildEmitter = (node: MeasuredNode) => string;

/** Plain single-layout child emitter: a nested table for containers, cell content for leaves. */
const emitChildSingle: ChildEmitter = (node) =>
  node.children.length > 0 && node.role !== "text"
    ? emitContainer(node, node.rect.width, emitChildSingle)
    : emitLeaf(node);

/** Group siblings into rows by measured vertical overlap; sort each row left-to-right. */
const bucketRows = (children: MeasuredNode[]): MeasuredNode[][] => {
  const sorted = [...children].sort(
    (a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x
  );
  const rows: MeasuredNode[][] = [];
  let bandBottom = -Infinity;
  for (const child of sorted) {
    // A child joins the current row if it starts before the current band ends —
    // i.e. it vertically overlaps something already in the row (measured, not guessed).
    if (rows.length > 0 && child.rect.y < bandBottom - ROW_TOLERANCE) {
      rows[rows.length - 1].push(child);
      bandBottom = Math.max(bandBottom, child.rect.y + child.rect.height);
    } else {
      rows.push([child]);
      bandBottom = child.rect.y + child.rect.height;
    }
  }
  for (const row of rows) row.sort((a, b) => a.rect.x - b.rect.x);
  return rows;
};

/** Horizontal alignment of a lone child, derived from its measured x-offsets. */
const deriveAlign = (child: MeasuredNode, parent: MeasuredNode): string => {
  const leftGap = child.rect.x - parent.rect.x;
  const rightGap =
    parent.rect.x + parent.rect.width - (child.rect.x + child.rect.width);
  if (Math.abs(leftGap - rightGap) <= ALIGN_TOLERANCE) return "center";
  return leftGap > rightGap ? "right" : "left";
};

/**
 * Vertical alignment of a column within its row, derived from where it sits in the row's
 * measured band — so a shorter item that flex `align-items:center` centred stays centred in
 * the table cell rather than jumping to the top.
 */
const deriveValign = (
  child: MeasuredNode,
  bandTop: number,
  bandBottom: number
): string => {
  const topGap = child.rect.y - bandTop;
  const bottomGap = bandBottom - (child.rect.y + child.rect.height);
  if (Math.abs(topGap - bottomGap) <= ALIGN_TOLERANCE) return "middle";
  return topGap > bottomGap ? "bottom" : "top";
};

// A collapsed, invisible spacer cell reproduces a measured gap (vertical between rows,
// horizontal between columns) in a way every email client respects.
const SPACER_STYLE = "font-size: 1px; line-height: 1px;";
const spacerCell = (dimension: "height" | "width", px: number): string =>
  `<td ${dimension}="${round(px)}" style="${SPACER_STYLE}">&nbsp;</td>`;

const spacerRow = (height: number): string =>
  `<tr>${spacerCell("height", height)}</tr>`;

const rowTop = (row: MeasuredNode[]): number =>
  Math.min(...row.map((n) => n.rect.y));
const rowBottom = (row: MeasuredNode[]): number =>
  Math.max(...row.map((n) => n.rect.y + n.rect.height));

/** Measured horizontal gap between a column and the one before it (0 for the first). */
const columnGap = (row: MeasuredNode[], index: number): number =>
  index === 0
    ? 0
    : row[index].rect.x - (row[index - 1].rect.x + row[index - 1].rect.width);

// ── Responsive: two-layout (desktop + measured mobile) ────────────────────────────────
//
// Compilation measures the design at desktop AND at a hidden mobile width. Where a section
// REFLOWS (its columns restack on mobile), we emit BOTH layouts — the desktop tables from
// the desktop measurement and the mobile tables from the mobile measurement — and toggle
// between them with a measured @media block. Because the mobile copy is emitted from the
// mobile measurement, it reproduces the mobile layout faithfully (stacking AND alignment/
// centering), not just a stack. Outlook (which ignores @media) is pinned to the desktop copy
// via `mso-hide:all` on the mobile copy. Which sections reflow is observed, never inferred
// (ADR-0004). `pc-` matches the chrome's existing email class prefix.
const D_CLASS = "pc-d"; // desktop copy: shown by default, hidden on mobile
const M_CLASS = "pc-m"; // mobile copy: hidden by default + in Outlook, shown on mobile

interface EmitContext {
  /** Measured mobile geometry keyed by id — present only when a mobile render was measured. */
  mobileIndex?: Map<string, MeasuredNode>;
}

const indexById = (
  node: MeasuredNode,
  map: Map<string, MeasuredNode>
): void => {
  if (node.id) map.set(node.id, node);
  for (const child of node.children) indexById(child, map);
};

const buildIndex = (tree: MeasuredTree): Map<string, MeasuredNode> => {
  const map = new Map<string, MeasuredNode>();
  indexById(tree.root, map);
  return map;
};

/**
 * Does this desktop row of columns stack vertically on mobile? Observed from the mobile
 * measurement: if the same ids no longer share a row (their mobile y-tops span more than the
 * row tolerance) they stack. If any column is missing from the mobile tree we can't tell, so
 * treat it as not stacking (falls back to the desktop fixed-cell layout).
 */
const rowStacksOnMobile = (row: MeasuredNode[], ctx: EmitContext): boolean => {
  if (!ctx.mobileIndex || row.length < 2) return false;
  const ys: number[] = [];
  for (const col of row) {
    const mobile = ctx.mobileIndex.get(col.id);
    if (!mobile) return false;
    ys.push(mobile.rect.y);
  }
  return Math.max(...ys) - Math.min(...ys) > ROW_TOLERANCE;
};

/** Emit a single row of columns (single layout), with measured gap + padding spacers. */
const emitRow = (
  row: MeasuredNode[],
  parent: MeasuredNode,
  emitChild: ChildEmitter
): string => {
  // A lone child narrower than its parent is positioned by alignment (a centered button
  // stays centered) rather than a baked column width.
  if (
    row.length === 1 &&
    row[0].rect.width < parent.rect.width - ROW_TOLERANCE
  ) {
    const align = deriveAlign(row[0], parent);
    return `<tr><td align="${align}" valign="top">${emitChild(
      row[0]
    )}</td></tr>`;
  }

  const bandTop = rowTop(row);
  const bandBottom = rowBottom(row);
  const cells: string[] = [];
  // Reproduce the parent's horizontal padding as leading/trailing spacer cells so the
  // columns keep their measured x-positions (e.g. a space-between header stays flush to the
  // edges) instead of collapsing to the cell edge.
  const leadPad = row[0].rect.x - parent.rect.x;
  if (leadPad > ROW_TOLERANCE) cells.push(spacerCell("width", leadPad));
  row.forEach((child, index) => {
    const gap = columnGap(row, index);
    if (gap > 0) cells.push(spacerCell("width", gap));
    const valign = deriveValign(child, bandTop, bandBottom);
    // Only bake a fixed column width when the row actually has columns; a single full-width
    // child fills the cell, and pinning it would block fluid shrink.
    const widthAttr =
      row.length > 1 ? ` width="${round(child.rect.width)}"` : "";
    cells.push(`<td${widthAttr} valign="${valign}">${emitChild(child)}</td>`);
  });
  const last = row[row.length - 1];
  const trailPad =
    parent.rect.x + parent.rect.width - (last.rect.x + last.rect.width);
  if (trailPad > ROW_TOLERANCE) cells.push(spacerCell("width", trailPad));
  return `<tr>${cells.join("")}</tr>`;
};

/**
 * Emit a container node as a nested presentation table. `width` defaults to the node's own
 * measured width; the root passes the email's content width explicitly (see {@link emit}).
 */
const emitContainer = (
  node: MeasuredNode,
  width: number,
  emitChild: ChildEmitter
): string => {
  const rows = bucketRows(node.children);
  const body: string[] = [];
  // Reproduce the container's top padding (space above the first child).
  if (rows.length > 0) {
    const padTop = rowTop(rows[0]) - node.rect.y;
    if (padTop > ROW_TOLERANCE) body.push(spacerRow(padTop));
  }
  rows.forEach((row, index) => {
    if (index > 0) {
      const gap = rowTop(row) - rowBottom(rows[index - 1]);
      if (gap > 0) body.push(spacerRow(gap));
    }
    body.push(emitRow(row, node, emitChild));
  });
  // ...and its bottom padding (space below the last child).
  if (rows.length > 0) {
    const padBottom =
      node.rect.y + node.rect.height - rowBottom(rows[rows.length - 1]);
    if (padBottom > ROW_TOLERANCE) body.push(spacerRow(padBottom));
  }

  // Fluid: width:100% capped at the measured px, so it holds the measured width on desktop
  // but shrinks on a narrow (non-Outlook) client instead of forcing a min-width the viewport
  // can't honour. Outlook is pinned to the desktop copy by the two-layout toggle.
  const tableStyle = styleString([
    ["border-collapse", "collapse"],
    ["width", "100%"],
    ["max-width", `${round(width)}px`],
    ["background-color", forceLightColor(node.styles.backgroundColor)],
  ]);
  return (
    `<table${idAttr(node.id)} role="presentation" border="0" cellpadding="0"` +
    ` cellspacing="0" width="100%" style="${tableStyle}">` +
    `<tbody>${body.join("")}</tbody></table>`
  );
};

/**
 * Does this container REFLOW on mobile — i.e. does any of its multi-column rows restack
 * (observed from the mobile measurement)? Such a container is emitted as two layouts.
 */
const reflows = (node: MeasuredNode, ctx: EmitContext): boolean => {
  if (!ctx.mobileIndex || !ctx.mobileIndex.get(node.id)) return false;
  return bucketRows(node.children).some(
    (row) => row.length > 1 && rowStacksOnMobile(row, ctx)
  );
};

/** Wrap the two measured layouts, defaulting to desktop; Outlook keeps desktop (mso-hide). */
const twoLayout = (desktopHtml: string, mobileHtml: string): string =>
  `<div class="${D_CLASS}">${desktopHtml}</div>` +
  `<div class="${M_CLASS}" style="display: none; mso-hide: all;">${mobileHtml}</div>`;

/**
 * A child emitter that two-layouts the FIRST container that reflows on mobile — emitting its
 * desktop tables from the desktop tree and its mobile tables from the mobile tree — and
 * otherwise descends, so a reflowing section anywhere in the design is caught.
 */
const makeResponsiveChildEmitter = (ctx: EmitContext): ChildEmitter => {
  const emitChild: ChildEmitter = (node) => {
    if (!(node.children.length > 0 && node.role !== "text"))
      return emitLeaf(node);
    // reflows() already confirmed the mobile node exists.
    if (ctx.mobileIndex && reflows(node, ctx)) {
      const mobile = ctx.mobileIndex.get(node.id) as MeasuredNode;
      return twoLayout(
        emitContainer(node, node.rect.width, emitChildSingle),
        emitContainer(mobile, mobile.rect.width, emitChildSingle)
      );
    }
    return emitContainer(node, node.rect.width, emitChild);
  };
  return emitChild;
};

/**
 * Emit the Compiled email body (nested tables) from the desktop MeasuredTree. When a mobile
 * MeasuredTree is supplied, each section that reflows on mobile is emitted as two layouts —
 * desktop tables and mobile tables (from the mobile measurement) — toggled by the measured
 * @media block (collectMediaQuery); without it the output is the plain desktop layout. Chrome
 * (outer shell, head, MSO conditionals, the @media block) is wrapped around this separately.
 */
export const emit = (desktop: MeasuredTree, mobile?: MeasuredTree): string => {
  if (!mobile) {
    return emitContainer(desktop.root, desktop.contentWidth, emitChildSingle);
  }
  const ctx: EmitContext = { mobileIndex: buildIndex(mobile) };
  return emitContainer(
    desktop.root,
    desktop.contentWidth,
    makeResponsiveChildEmitter(ctx)
  );
};

/** Does any section anywhere in the tree reflow? Drives whether the toggle @media is needed. */
const hasReflow = (node: MeasuredNode, ctx: EmitContext): boolean =>
  reflows(node, ctx) || node.children.some((child) => hasReflow(child, ctx));

/**
 * The measured `@media` block that toggles the desktop/mobile layouts (ADR-0004): below the
 * measured desktop content width the desktop copy is hidden and the mobile copy shown. The
 * breakpoint sits just under the content width so a viewport at exactly it still shows
 * desktop. Returns "" when nothing reflows (or no mobile render).
 */
export const collectMediaQuery = (
  desktop: MeasuredTree,
  mobile?: MeasuredTree
): string => {
  if (!mobile) return "";
  const ctx: EmitContext = { mobileIndex: buildIndex(mobile) };
  if (!hasReflow(desktop.root, ctx)) return "";
  // Just below the desktop column width: a viewport at exactly the content width still shows
  // desktop; anything narrower switches to the mobile copy. (max-width is inclusive.)
  const breakpoint = round(desktop.contentWidth) - 1;
  return (
    `@media screen and (max-width: ${breakpoint}px) {\n` +
    `  .${D_CLASS} { display: none !important; }\n` +
    `  .${M_CLASS} { display: block !important; }\n` +
    `}`
  );
};

// ── Force light: Outlook.com colour reassertions (ADR-0006) ───────────────────────────
//
// Outlook.com's dark mode tags recoloured elements with `[data-ogsc]` (text) / `[data-ogsb]`
// (background). Because the emitter knows every colour it placed and stamps each on an
// element with a stable id, it can emit matching `!important` overrides that pin those
// elements back to the light palette. This walks the same tree the body was emitted from,
// so the two never disagree, and stays a pure function for unit testing.

const collectOverrides = (node: MeasuredNode, out: string[]): void => {
  const id = node.id;
  if (id) {
    // Only reassert colours the emitter actually placed: text colour on text/button leaves,
    // background on the elements that bake one (containers, boxes, buttons).
    const placesText = node.role === "text" || node.role === "button";
    const placesBg =
      node.role === "root" ||
      node.role === "container" ||
      node.role === "box" ||
      node.role === "button";
    const color = placesText ? forceLightColor(node.styles.color) : undefined;
    const bg = placesBg
      ? forceLightColor(node.styles.backgroundColor)
      : undefined;
    if (color) {
      out.push(`#${id}[data-ogsc] { color: ${color} !important; }`);
    }
    if (bg) {
      out.push(`#${id}[data-ogsb] { background-color: ${bg} !important; }`);
    }
  }
  for (const child of node.children) collectOverrides(child, out);
};

/**
 * The Outlook `[data-ogsc]/[data-ogsb]` colour reassertion CSS for a tree — injected into
 * the email Chrome's <head> so dark-mode Outlook.com keeps the design's colours. Returns
 * "" when the design places no colours.
 */
export const collectColorOverrides = (tree: MeasuredTree): string => {
  const out: string[] = [];
  collectOverrides(tree.root, out);
  return out.join("\n");
};

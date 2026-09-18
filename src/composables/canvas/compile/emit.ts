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

/** Force-light the colour inside a measured border string ("1px solid rgb(…)"). */
const forceLightBorder = (border?: string): string | undefined =>
  border
    ? border.replace(
        /rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|\b(?:white|black)\b/g,
        (c) => forceLightColor(c) || c
      )
    : border;

/**
 * Measured borders as style pairs: one `border` when all four sides match (the usual case:
 * an outlined pill, a bordered button), else per side. Empty when there is no border.
 */
const borderPairs = (
  styles: MeasuredStyles
): Array<[string, string | undefined]> => {
  const sides = [
    styles.borderTop,
    styles.borderRight,
    styles.borderBottom,
    styles.borderLeft,
  ];
  if (sides[0] && sides.every((s) => s === sides[0])) {
    return [["border", forceLightBorder(sides[0])]];
  }
  return [
    ["border-top", forceLightBorder(styles.borderTop)],
    ["border-right", forceLightBorder(styles.borderRight)],
    ["border-bottom", forceLightBorder(styles.borderBottom)],
    ["border-left", forceLightBorder(styles.borderLeft)],
  ];
};

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
  // Letter-spacing changes where text wraps; dropping it pushed titles onto extra lines.
  ["letter-spacing", styles.letterSpacing],
  ["color", forceLightColor(styles.color)],
  ["text-align", styles.textAlign],
];

/**
 * A text element's own measured padding. Its measured rect is border-box (padding included),
 * and the cell it lands in is pinned to that rect, so emitting the padding inside the block
 * keeps the text content wrapping at exactly the width the Canvas showed. (The CONTAINER's
 * padding is a separate concern, reproduced by spacer cells/rows from the children's offsets.)
 */
const paddingPairs = (
  styles: MeasuredStyles
): Array<[string, string | undefined]> => [
  ["padding-top", styles.paddingTop],
  ["padding-right", styles.paddingRight],
  ["padding-bottom", styles.paddingBottom],
  ["padding-left", styles.paddingLeft],
];

const buttonStyle = (styles: MeasuredStyles): string =>
  styleString([
    ["display", "inline-block"],
    ["background-color", forceLightColor(styles.backgroundColor)],
    ["color", forceLightColor(styles.color)],
    ["border-radius", styles.borderRadius],
    // A border the user gave the button (measured, force-lit) — dropped until now.
    ...borderPairs(styles),
    ["font-family", styles.fontFamily],
    ["font-size", styles.fontSize],
    ["font-weight", styles.fontWeight],
    // Without the measured line-height the label's line box falls back to the font's natural
    // height, and every button came out 3px shorter than the Canvas.
    ["line-height", styles.lineHeight],
    ["letter-spacing", styles.letterSpacing],
    ["padding-top", styles.paddingTop],
    ["padding-right", styles.paddingRight],
    ["padding-bottom", styles.paddingBottom],
    ["padding-left", styles.paddingLeft],
    ["text-decoration", "none"],
    // A phone can be narrower than the width the mobile copy was measured at (the chrome's
    // gutters alone take 375 down to 355), and a squeezed row shrinks every cell a few
    // percent. The label must not wrap for that: nowrap holds the button's min-content width
    // so the row's spacer cells absorb the squeeze instead.
    ["white-space", "nowrap"],
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
  // A measured border becomes the VML stroke (Outlook draws no CSS border on the <a>);
  // without one the stroke matches the fill so it stays invisible.
  const border = node.styles.borderTop;
  const borderColor = border
    ? rgbToHex(
        forceLightColor(
          (border.match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/) || [])[0]
        )
      )
    : undefined;
  const strokeAttrs =
    border && borderColor
      ? ` strokecolor="${borderColor}" strokeweight="${border.split(" ")[0]}"`
      : ` strokecolor="${fill}"`;
  const centerStyle = styleString([
    ["color", textColor],
    ["font-family", node.styles.fontFamily],
    ["font-size", node.styles.fontSize],
    ["font-weight", node.styles.fontWeight],
    ["letter-spacing", node.styles.letterSpacing],
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
    )}"${strokeAttrs} fillcolor="${fill}">` +
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
      // max-width:100% lets the image shrink with a narrow (non-Outlook) client. Measured
      // corner radius rides along (rounded banner/story images were coming out square).
      const style = styleString([
        ["display", "block"],
        ["max-width", "100%"],
        ["border-radius", node.styles.borderRadius],
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
        ...borderPairs(node.styles),
      ]);
      return `<div${idAttr(node.id)} style="${style}">&nbsp;</div>`;
    }
    case "text":
    default: {
      const content = escapeHtml(node.text || "");
      // Text that was ONE line on the Canvas (a label, a title that fit) must stay one line
      // when a narrow phone squeezes its row (chrome gutters alone take 375 down to 355, and
      // phones go to 320): nowrap holds its min-content width so the row's spacer cells
      // absorb the squeeze instead. Multi-line paragraphs keep wrapping naturally.
      const lineHeight = parseFloat(node.styles.lineHeight || "");
      const singleLine =
        !Number.isNaN(lineHeight) &&
        node.rect.height <= lineHeight + ROW_TOLERANCE;
      const wrapPairs: Array<[string, string | undefined]> = singleLine
        ? [["white-space", "nowrap"]]
        : [];
      // A text leaf that is itself a link keeps its href (e.g. footer "Unsubscribe", header
      // nav links) rather than being flattened to inert text. Links underline by default, so
      // reproduce the Canvas's measured text-decoration (usually "none") to avoid an
      // unwanted underline.
      if (node.href) {
        // display:block — each leaf owns its cell, and an INLINE <a>'s box is the font's
        // content area (ignoring line-height), so links measured at 24px rendered 18px.
        const linkStyle = styleString([
          ["display", "block"],
          ...fontStylePairs(node.styles),
          ["text-decoration", node.styles.textDecoration || "none"],
          ...wrapPairs,
        ]);
        return `<a${idAttr(node.id)} href="${escapeAttr(
          node.href
        )}" style="${linkStyle}">${content}</a>`;
      }
      const style = styleString([
        ...fontStylePairs(node.styles),
        ...paddingPairs(node.styles),
        ...wrapPairs,
      ]);
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
// Compilation measures the design at desktop AND at the mobile breakpoint. Every top-level
// section (one per placed component) is emitted as BOTH layouts — its desktop tables from
// the desktop measurement and its mobile tables from the mobile measurement — toggled by a
// measured @media block. Always both, not only where columns restack: the mobile Canvas
// also differs in font sizes, weights, paddings and image sizes, and a fluid-shrunk desktop
// copy reproduces none of that (it just scales everything by mobile/desktop width). Because
// the mobile copy is emitted from the mobile measurement, the mobile layout is observed,
// never inferred (ADR-0004). Outlook (which ignores @media) is pinned to the desktop copy
// via `mso-hide:all` on the mobile copy. `pc-` matches the chrome's existing class prefix.
const D_CLASS = "pc-d"; // desktop copy: shown by default, hidden on mobile
const M_CLASS = "pc-m"; // mobile copy: hidden by default + in Outlook, shown on mobile

/** Emit a single row of columns (single layout), with measured gap + padding spacers. */
const emitRow = (
  row: MeasuredNode[],
  parent: MeasuredNode,
  emitChild: ChildEmitter
): string => {
  const bandTop = rowTop(row);
  const bandBottom = rowBottom(row);
  const cells: string[] = [];
  // Reproduce the parent's horizontal padding as leading/trailing spacer cells so the
  // columns keep their measured x-positions (e.g. a space-between header stays flush to the
  // edges) instead of collapsing to the cell edge. The same spacers position a LONE child
  // narrower than its parent (a centered button, an inset paragraph): its measured x is the
  // leading spacer and its measured width is pinned on the cell, so a block text leaf wraps
  // at the width the Canvas showed instead of filling the whole container. (This used to be
  // alignment-only to keep the desktop layout fluid; the two-layout mobile copy made that
  // moot, and alignment alone let block text spread to full width.)
  // Widths: pinned cells round UP, spacers round DOWN, and the trailing spacer takes the
  // exact remainder. Measured widths are sub-pixel (a title at 374.3px); rounding its cell
  // DOWN to 374 left the text a fraction too wide for the cell, so the last word wrapped and
  // every height below it doubled. Rounding up keeps text on the lines the Canvas showed,
  // and the remainder keeps the row summing to its parent's width.
  const rowWidth = round(parent.rect.width);
  let used = 0;
  const push = (cell: string, px: number): void => {
    cells.push(cell);
    used += px;
  };
  const leadPad = Math.floor(row[0].rect.x - parent.rect.x);
  if (leadPad > ROW_TOLERANCE) push(spacerCell("width", leadPad), leadPad);
  row.forEach((child, index) => {
    const gap = Math.floor(columnGap(row, index));
    if (gap > 0) push(spacerCell("width", gap), gap);
    const valign = deriveValign(child, bandTop, bandBottom);
    // Pin the measured width whenever the child doesn't simply fill its parent — real
    // columns, or a lone child narrower than the container. A single full-width child is
    // left unpinned so it fills the cell.
    const pinWidth =
      row.length > 1 || child.rect.width < parent.rect.width - ROW_TOLERANCE;
    const width = Math.ceil(child.rect.width);
    const widthAttr = pinWidth ? ` width="${width}"` : "";
    push(
      `<td${widthAttr} valign="${valign}">${emitChild(child)}</td>`,
      pinWidth ? width : rowWidth - used
    );
  });
  const trailPad = rowWidth - used;
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
    // Each row gets its OWN table. In an HTML table every row shares one column grid, so
    // rows shaped [40|520|40] and [262|77|261] would be reconciled into a single grid whose
    // columns sum past the width, shrinking every cell (a 520px paragraph rendered at 327px
    // and wrapped word-per-line). Stacking one single-row table per row inside this
    // single-column table keeps each row's measured widths intact.
    body.push(
      `<tr><td><table role="presentation" border="0" cellpadding="0" cellspacing="0"` +
        ` width="100%" style="border-collapse: collapse; width: 100%;">` +
        `<tbody>${emitRow(row, node, emitChild)}</tbody></table></td></tr>`
    );
  });
  // ...and its bottom padding (space below the last child).
  if (rows.length > 0) {
    const padBottom =
      node.rect.y + node.rect.height - rowBottom(rows[rows.length - 1]);
    if (padBottom > ROW_TOLERANCE) body.push(spacerRow(padBottom));
  }

  // Fluid: width:100% capped at the measured px, so it holds the measured width on desktop
  // but shrinks on a narrow (non-Outlook) client instead of forcing a min-width the viewport
  // can't honour. Outlook is pinned to the desktop copy by the two-layout toggle. A measured
  // background image rides along with its size/position/repeat (styleString normalises the
  // url("…") quotes to url('…'), which stays valid inside the style attribute).
  const tableStyle = styleString([
    ["border-collapse", "collapse"],
    ["width", "100%"],
    // Round UP: a sub-pixel measured width rounded down wraps shrink-wrapped text.
    ["max-width", `${Math.ceil(width)}px`],
    ["background-color", forceLightColor(node.styles.backgroundColor)],
    // A rounded / outlined wrapper (a "See more" pill with a 1px border and no fill) keeps
    // its measured corners and border.
    ["border-radius", node.styles.borderRadius],
    ...borderPairs(node.styles),
    ["background-image", node.styles.backgroundImage],
    ["background-size", node.styles.backgroundSize],
    ["background-position", node.styles.backgroundPosition],
    ["background-repeat", node.styles.backgroundRepeat],
  ]);
  const table =
    `<table${idAttr(node.id)} role="presentation" border="0" cellpadding="0"` +
    ` cellspacing="0" width="100%" style="${tableStyle}">` +
    `<tbody>${body.join("")}</tbody></table>`;
  // A linked wrapper (an <a> around a label + icon) stays clickable: the whole table sits
  // inside the link. Block-level links around tables are valid HTML and honoured by the
  // major clients; the link itself adds no styling of its own.
  if (node.href) {
    return (
      `<a href="${escapeAttr(
        node.href
      )}" style="display: block; text-decoration: none;` +
      ` color: inherit;">${table}</a>`
    );
  }
  return table;
};

/** Wrap the two measured layouts, defaulting to desktop; Outlook keeps desktop (mso-hide). */
const twoLayout = (desktopHtml: string, mobileHtml: string): string =>
  `<div class="${D_CLASS}">${desktopHtml}</div>` +
  `<div class="${M_CLASS}" style="display: none; mso-hide: all;">${mobileHtml}</div>`;

/**
 * Emit the Compiled email body (nested tables) from the desktop MeasuredTree. With a mobile
 * MeasuredTree, every top-level section is emitted as two layouts (see the Responsive notes
 * above), toggled by the measured @media block (collectMediaQuery); without it the output is
 * the plain desktop layout. Sections pair by POSITION: the root's children are the placed
 * components in order (their wrapper ids repeat, so ids can't pair them), and both trees
 * hold the same components in the same order. Chrome (outer shell, head, MSO conditionals,
 * the @media block) is wrapped around this separately.
 */
export const emit = (desktop: MeasuredTree, mobile?: MeasuredTree): string => {
  if (!mobile) {
    return emitContainer(desktop.root, desktop.contentWidth, emitChildSingle);
  }
  const mobileSections = mobile.root.children;
  let position = 0;
  const emitSection: ChildEmitter = (node) => {
    const counterpart = mobileSections[position++];
    const isContainer = node.children.length > 0 && node.role !== "text";
    if (!isContainer || !counterpart) return emitChildSingle(node);
    return twoLayout(
      emitContainer(node, node.rect.width, emitChildSingle),
      emitContainer(counterpart, counterpart.rect.width, emitChildSingle)
    );
  };
  return emitContainer(desktop.root, desktop.contentWidth, emitSection);
};

/**
 * The measured `@media` block that toggles the desktop/mobile layouts (ADR-0004): below the
 * measured desktop content width the desktop copy is hidden and the mobile copy shown. The
 * breakpoint sits just under the content width so a viewport at exactly it still shows
 * desktop. Returns "" without a mobile render (then there is no mobile copy to toggle to).
 */
export const collectMediaQuery = (
  desktop: MeasuredTree,
  mobile?: MeasuredTree
): string => {
  if (!mobile || mobile.root.children.length === 0) return "";
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

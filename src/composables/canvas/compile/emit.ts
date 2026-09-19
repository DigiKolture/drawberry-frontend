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
// dark @media — ADR-0006). Given a mobile MeasuredTree, the desktop tables are emitted ONCE
// with id-keyed @media rules that rewrite whatever the mobile measurement differs in (see
// the Responsive notes below and compileBody); only a section whose structure can't be
// expressed by rules gets a second, mobile copy.
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

const buttonPairs = (
  styles: MeasuredStyles
): Array<[string, string | undefined]> => [
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
];

const buttonStyle = (styles: MeasuredStyles): string =>
  styleString(buttonPairs(styles));

/** Percentage of the button's height that the measured corner radius represents (VML arcsize). */
const arcsize = (styles: MeasuredStyles, height: number): string => {
  const radius = parseFloat(styles.borderRadius || "0");
  if (!radius || !height) return "0%";
  return `${Math.min(50, Math.round((radius / height) * 100))}%`;
};

// A bulletproof VML button: an Outlook-only rounded rectangle sized to the measured button,
// plus a styled <a> every other client uses. Both carry the measured width/padding/radius/
// colour, so the button looks the same and stays clickable everywhere (spec User Story 10).
const emitButton = (
  node: MeasuredNode,
  attrs: string = idAttr(node.id)
): string => {
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
    `<a${attrs}${href ? ` href="${href}"` : ""} style="${buttonStyle(
      node.styles
    )}">${text}</a>` +
    `<!--<![endif]-->`;
  return vml + fallback;
};

const idAttr = (id: string): string => (id ? ` id="${escapeAttr(id)}"` : "");

type StylePairs = Array<[string, string | undefined]>;

/**
 * Text that was ONE line on the Canvas (a label, a title that fit) must stay one line when a
 * narrow phone squeezes its row (chrome gutters alone take 375 down to 355, and phones go to
 * 320): nowrap holds its min-content width so the row's spacer cells absorb the squeeze
 * instead. Multi-line paragraphs keep wrapping naturally.
 */
const isSingleLine = (node: MeasuredNode): boolean => {
  const lineHeight = parseFloat(node.styles.lineHeight || "");
  return (
    !Number.isNaN(lineHeight) && node.rect.height <= lineHeight + ROW_TOLERANCE
  );
};

// The pairs each leaf kind bakes. The emitted style is the SPARSE form (unset values
// omitted); the mobile diff compares the EXPLICIT form (every property present, "0px" /
// "normal" defaults) so a value that is set on one breakpoint and unset on the other still
// produces a rule.
/** Is the image shown at its file's own ratio (so `height:auto` reproduces it)? */
const isProportional = (node: MeasuredNode): boolean => {
  const shown = node.rect.width > 0 ? node.rect.height / node.rect.width : 0;
  return (
    node.naturalRatio !== undefined &&
    Math.abs(shown - node.naturalRatio) <= node.naturalRatio * 0.03
  );
};

// A fluid, proportional image scales with the phone, so its height is `auto` — a pixel
// height in the mobile rule would pin it and warp the squeezed image.
const imagePairs = (node: MeasuredNode, fluid: boolean): StylePairs => [
  ["width", `${round(node.rect.width)}px`],
  [
    "height",
    fluid && isProportional(node) ? "auto" : `${round(node.rect.height)}px`,
  ],
  ["border-radius", node.styles.borderRadius || "0px"],
];
const boxPairs = (node: MeasuredNode): StylePairs => [
  ["height", `${round(node.rect.height)}px`],
  ["line-height", `${round(node.rect.height)}px`],
  ["font-size", "1px"],
  ["background-color", forceLightColor(node.styles.backgroundColor)],
  ["border-radius", node.styles.borderRadius],
  ...borderPairs(node.styles),
];
const explicitPadding = (styles: MeasuredStyles): StylePairs => [
  ["padding-top", styles.paddingTop || "0px"],
  ["padding-right", styles.paddingRight || "0px"],
  ["padding-bottom", styles.paddingBottom || "0px"],
  ["padding-left", styles.paddingLeft || "0px"],
];
const explicitFont = (styles: MeasuredStyles): StylePairs =>
  fontStylePairs(styles).map(([prop, value]) =>
    prop === "letter-spacing" ? [prop, value || "normal"] : [prop, value]
  );
const textPairsExplicit = (node: MeasuredNode): StylePairs => [
  ...explicitFont(node.styles),
  ...explicitPadding(node.styles),
  ["white-space", isSingleLine(node) ? "nowrap" : "normal"],
];
const linkPairsExplicit = (node: MeasuredNode): StylePairs => [
  ...explicitFont(node.styles),
  ["text-decoration", node.styles.textDecoration || "none"],
  ["white-space", isSingleLine(node) ? "nowrap" : "normal"],
];

/**
 * Emit a leaf node (text / image / button / box) as cell content. With its mobile twin and
 * a context, whatever the mobile measurement bakes differently becomes a rule on its id.
 */
const emitLeaf = (
  node: MeasuredNode,
  mobile?: MeasuredNode,
  ctx?: OverrideCtx,
  fluid = true
): string => {
  const diff = (pairs: (n: MeasuredNode) => StylePairs): string[] =>
    mobile && ctx ? diffPairs(pairs(node), pairs(mobile)) : [];
  switch (node.role) {
    case "image": {
      // An image that FILLS its row (a banner) is fluid: max-width:100% lets it shrink on a
      // narrow (non-Outlook) client, and height:auto makes that shrink proportional — with
      // only the height attribute a squeezed image kept its height and warped. Only when
      // the design shows the file at its own ratio, though: an icon the Canvas deliberately
      // stretches keeps its fixed height. An image narrower than its row (a logo, an icon)
      // is NOT fluid: max-width:100% would make it the cell that gives way under a squeeze
      // (a 36px logo shrank to 24), whereas a fixed width makes table layout shrink the
      // row's spacers first, which is what keeps the layout intact on a small phone.
      // (Outlook reads the attributes and ignores all of this.) Measured corner radius
      // rides along (rounded banner/story images were coming out square).
      const style = styleString([
        ["display", "block"],
        ["max-width", fluid ? "100%" : undefined],
        ["height", fluid && isProportional(node) ? "auto" : undefined],
        ["border-radius", node.styles.borderRadius],
      ]);
      return (
        `<img${ruleAttr(
          ctx,
          node.id,
          diff((n) => imagePairs(n, fluid))
        )} src="${escapeAttr(node.src || "")}"` +
        ` width="${round(node.rect.width)}" height="${round(
          node.rect.height
        )}"` +
        ` alt="${escapeAttr(node.alt || "")}" style="${style}" />`
      );
    }
    case "button":
      return emitButton(
        node,
        ruleAttr(
          ctx,
          node.id,
          diff((n) => buttonPairs(n.styles))
        )
      );
    case "box": {
      // A bare visual block: hold its measured height and background so it doesn't collapse.
      return `<div${ruleAttr(
        ctx,
        node.id,
        diff(boxPairs)
      )} style="${styleString(boxPairs(node))}">&nbsp;</div>`;
    }
    case "text":
    default: {
      const content = escapeHtml(node.text || "");
      const wrapPairs: StylePairs = isSingleLine(node)
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
        return `<a${ruleAttr(
          ctx,
          node.id,
          diff(linkPairsExplicit)
        )} href="${escapeAttr(node.href)}" style="${linkStyle}">${content}</a>`;
      }
      const style = styleString([
        ...fontStylePairs(node.styles),
        ...paddingPairs(node.styles),
        ...wrapPairs,
      ]);
      const styleAttr = style ? ` style="${style}"` : "";
      return `<div${ruleAttr(
        ctx,
        node.id,
        diff(textPairsExplicit)
      )}${styleAttr}>${content}</div>`;
    }
  }
};

// ── Responsive: one copy + measured mobile overrides ─────────────────────────────────
//
// Compilation measures the design at desktop AND at the mobile breakpoint. A section whose
// STRUCTURE is the same at both (same elements, same row grouping) is emitted ONCE — its
// desktop tables — plus id-keyed `@media` rules that rewrite exactly the numbers and styles
// that differ on mobile (cell and spacer widths, gaps, paddings, font sizes, image sizes…),
// every value taken from the mobile measurement. Only a section that RESTACKS on mobile
// (columns become rows: a different structure no rule can express) is emitted as two
// layouts, toggled by the same @media block. The mobile layout is observed, never inferred
// (ADR-0004), and the email stays close to single-copy size — Gmail clips above ~102KB, and
// two full copies of everything doubled it. Outlook ignores @media, so it always shows the
// desktop tables.

/** Collects the mobile @media rules while the desktop body is being emitted. */
interface OverrideCtx {
  rules: string[];
  nextId: () => string;
  /** The mobile email's content width — what an image must nearly fill to count as fluid. */
  mobileContentWidth: number;
}

const isContainer = (node: MeasuredNode): boolean =>
  node.children.length > 0 && node.role !== "text";

/**
 * Record a mobile rule for an element and return the id attribute to stamp on it: its own
 * id, or a fresh short one when it has none — and no id at all when there is no rule, so
 * ids cost bytes only where they are used.
 */
const ruleAttr = (
  ctx: OverrideCtx | undefined,
  id: string,
  decls: string[]
): string => {
  const own = decls.filter(Boolean);
  if (!ctx || own.length === 0) return idAttr(id);
  const target = id || ctx.nextId();
  ctx.rules.push(`#${target}{${own.map((d) => `${d}!important`).join(";")}}`);
  return idAttr(target);
};

/** The declarations in `mobile` whose value differs from `desktop` (both as style pairs). */
const diffPairs = (
  desktop: Array<[string, string | undefined]>,
  mobile: Array<[string, string | undefined]>
): string[] => {
  const d = new Map(desktop);
  return mobile
    .filter(
      ([prop, value]) =>
        value !== undefined && value !== "" && d.get(prop) !== value
    )
    .map(([prop, value]) => `${prop}:${String(value).replace(/"/g, "'")}`);
};

/** A container's children in reading order (row-major: the order the emitter lays out). */
const sequence = (node: MeasuredNode): MeasuredNode[] =>
  bucketRows(node.children).flat();

/**
 * Can one desktop copy + rules reproduce the mobile counterpart? Yes when both hold the
 * same elements in the same reading order, all the way down, and every desktop row either
 * stays one row on mobile or has EVERY member on its own row (a clean stack). A row that
 * stacks is expressed as rules — cells become full-width blocks positioned from their
 * mobile rects. Anything else (members reordered, a 3-up row that becomes 2+1) is a
 * structure no rule can express, and the section gets its own mobile tables instead.
 */
const compatible = (d: MeasuredNode, m: MeasuredNode): boolean => {
  if (d.id !== m.id || d.role !== m.role) return false;
  if (!isContainer(d) || !isContainer(m)) {
    return isContainer(d) === isContainer(m);
  }
  const seqD = sequence(d);
  const seqM = sequence(m);
  if (seqD.length !== seqM.length) return false;
  if (!seqD.every((child, i) => compatible(child, seqM[i]))) return false;
  const twinOf = new Map(seqD.map((child, i) => [child, seqM[i]]));
  return bucketRows(d.children).every((row) => {
    if (row.length === 1) return true;
    const twins = row.map((child) => twinOf.get(child) as MeasuredNode);
    const mobileRows = bucketRows(twins).length;
    return mobileRows === 1 || mobileRows === twins.length;
  });
};

/**
 * Renders one measured node — with its mobile counterpart when overrides are being
 * collected. Threaded through emitContainer/emitRow so the same layout code serves the
 * plain, the overridden and the two-layout paths.
 */
type ChildEmitter = (
  node: MeasuredNode,
  mobile?: MeasuredNode,
  /** Does the child fill its row? Decides whether an image may shrink (see emitLeaf). */
  fluid?: boolean
) => string;

/** A child emitter: nested tables for containers, cell content for leaves. */
const makeChildEmitter = (ctx?: OverrideCtx): ChildEmitter => {
  const emitChild: ChildEmitter = (node, mobile, fluid) =>
    isContainer(node)
      ? emitContainer(node, node.rect.width, emitChild, mobile, ctx)
      : emitLeaf(node, mobile, ctx, fluid);
  return emitChild;
};

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
const spacerCell = (
  dimension: "height" | "width",
  px: number,
  attrs = ""
): string =>
  `<td${attrs} ${dimension}="${round(px)}" style="${SPACER_STYLE}">&nbsp;</td>`;

/**
 * A spacer the DESKTOP row doesn't have but the mobile row needs (a lone logo that sits
 * flush on desktop and centred on a phone). Emitted hidden, and shown by its mobile rule
 * at the measured width. Padding on the neighbouring cell was the previous answer, and
 * padding never yields: on a phone narrower than the measurement, 147px + 148px of it
 * squeezed a 40px logo into a sliver. A spacer CELL yields — table layout shrinks it before
 * it shrinks content — which is exactly how the desktop-born spacers already survive the
 * squeeze.
 */
const phantomSpacer = (ctx: OverrideCtx | undefined, px: number): string =>
  `<td${ruleAttr(ctx, "", [
    "display:table-cell",
    `width:${px}px`,
  ])} width="0" style="display: none; ${SPACER_STYLE}">&nbsp;</td>`;

/**
 * A spacer row; a mobile rule (height / display:none) lands on the <td>, not the <tr>: the
 * cell carries `height="N"`, and a row can never be shorter than its cell, so a height on
 * the row would be ignored.
 */
const spacerRow = (height: number, attrs = ""): string =>
  `<tr>${spacerCell("height", height, attrs)}</tr>`;

const rowTop = (row: MeasuredNode[]): number =>
  Math.min(...row.map((n) => n.rect.y));
const rowBottom = (row: MeasuredNode[]): number =>
  Math.max(...row.map((n) => n.rect.y + n.rect.height));

/** Measured horizontal gap between a column and the one before it (0 for the first). */
const columnGap = (row: MeasuredNode[], index: number): number =>
  index === 0
    ? 0
    : row[index].rect.x - (row[index - 1].rect.x + row[index - 1].rect.width);

// Two-layout (a restacking section only): the desktop copy shows by default and Outlook
// (no @media) never sees the mobile one, thanks to `mso-hide:all`. `pc-` matches the
// chrome's existing class prefix.
const D_CLASS = "pc-d"; // desktop copy of a restacking section: hidden on mobile
const M_CLASS = "pc-m"; // its mobile copy: hidden by default + in Outlook, shown on mobile

/**
 * Integer cell metrics for one row. Pinned cells round UP, spacers round DOWN, and the
 * trailing spacer takes the exact remainder: measured widths are sub-pixel (a title at
 * 374.3px), and rounding its cell DOWN to 374 left the text a fraction too wide, so the
 * last word wrapped and every height below it doubled. Rounding up keeps text on the lines
 * the Canvas showed; the remainder keeps the row summing to its parent's width.
 */
interface RowMetrics {
  rowWidth: number;
  lead: number;
  gaps: number[];
  pinned: boolean[];
  widths: number[];
  trail: number;
}
const rowMetrics = (row: MeasuredNode[], parent: MeasuredNode): RowMetrics => {
  const rowWidth = round(parent.rect.width);
  const lead = Math.floor(row[0].rect.x - parent.rect.x);
  let used = lead > ROW_TOLERANCE ? lead : 0;
  const gaps: number[] = [];
  const pinned: boolean[] = [];
  const widths: number[] = [];
  row.forEach((child, index) => {
    const gap = Math.floor(columnGap(row, index));
    gaps.push(gap);
    if (gap > 0) used += gap;
    // Pin the measured width whenever the child doesn't simply fill its parent — real
    // columns, or a lone child narrower than the container. A single full-width child is
    // left unpinned so it fills the cell.
    const pin =
      row.length > 1 || child.rect.width < parent.rect.width - ROW_TOLERANCE;
    const width = Math.ceil(child.rect.width);
    pinned.push(pin);
    widths.push(width);
    used += pin ? width : rowWidth - used;
  });
  return { rowWidth, lead, gaps, pinned, widths, trail: rowWidth - used };
};

/** Mobile rule for a spacer the desktop row has: a new width, or gone. */
const spacerDecls = (
  desktopPx: number,
  mobilePx: number | undefined
): string[] => {
  if (mobilePx === undefined) return [];
  if (mobilePx <= ROW_TOLERANCE) return ["display:none"];
  return mobilePx !== desktopPx ? [`width:${mobilePx}px`] : [];
};

/**
 * Emit a single row of columns with measured gap + padding spacers. The parent's horizontal
 * padding becomes leading/trailing spacer cells so columns keep their measured x (a
 * space-between header stays flush to the edges); the same spacers position a LONE child
 * narrower than its parent (a centred button, an inset paragraph), whose measured width is
 * pinned on its cell so block text wraps where the Canvas wrapped it.
 *
 * With the row's mobile twin (same members) and a context, each cell or spacer whose
 * mobile metric differs gets an id + a rule; a spacer the desktop row LACKS but mobile
 * needs becomes padding on the neighbouring content cell.
 */
const emitRow = (
  row: MeasuredNode[],
  parent: MeasuredNode,
  emitChild: ChildEmitter,
  ctx?: OverrideCtx,
  mRow?: MeasuredNode[],
  mParent?: MeasuredNode
): string => {
  const bandTop = rowTop(row);
  const bandBottom = rowBottom(row);
  const d = rowMetrics(row, parent);
  // The row's twins either share one mobile row (metrics compare cell by cell) or STACK, one
  // per mobile row (compatible() allows nothing in between): then every spacer goes and each
  // cell becomes a full-width block placed by padding from its own mobile rect — the
  // standard way a column row restacks on a phone, here with measured numbers.
  const stacked =
    !!ctx &&
    !!mRow &&
    !!mParent &&
    row.length > 1 &&
    bucketRows(mRow).length > 1;
  const m =
    ctx && mRow && mParent && !stacked ? rowMetrics(mRow, mParent) : undefined;
  const gone = stacked ? ["display:none"] : undefined;
  const cellDecls: string[][] = row.map(() => []);
  if (stacked && mRow && mParent) {
    const rowWidthM = round(mParent.rect.width);
    // `width:auto` on a block cell: it fills its row and the paddings set the content
    // width, so the result doesn't depend on the client's box-sizing (a width + padding
    // rule collapses to nothing under border-box) — and it cancels the desktop cell's
    // `width="N"` attribute, which would otherwise still pin the block at its column width.
    mRow.forEach((twin, index) => {
      const left = Math.floor(twin.rect.x - mParent.rect.x);
      const width = Math.ceil(twin.rect.width);
      const right = Math.max(rowWidthM - left - width, 0);
      cellDecls[index].push(
        "display:block",
        "width:auto",
        `padding-left:${left}px`,
        `padding-right:${right}px`
      );
      if (index > 0) {
        const previous = mRow[index - 1];
        const gap = round(
          twin.rect.y - (previous.rect.y + previous.rect.height)
        );
        if (gap > 0) cellDecls[index].push(`padding-top:${gap}px`);
      }
    });
  }

  let leadCell = "";
  if (d.lead > ROW_TOLERANCE) {
    leadCell = spacerCell(
      "width",
      d.lead,
      ruleAttr(ctx, "", gone ?? spacerDecls(d.lead, m?.lead))
    );
  } else if (m && m.lead > ROW_TOLERANCE) {
    leadCell = phantomSpacer(ctx, m.lead);
  }
  const gapCells: string[] = row.map((child, index) => {
    if (d.gaps[index] > 0) {
      return spacerCell(
        "width",
        d.gaps[index],
        ruleAttr(
          ctx,
          "",
          gone ?? spacerDecls(d.gaps[index], m && m.gaps[index])
        )
      );
    }
    if (m && m.gaps[index] > 0) return phantomSpacer(ctx, m.gaps[index]);
    return "";
  });
  let trailCell = "";
  if (d.trail > ROW_TOLERANCE) {
    trailCell = spacerCell(
      "width",
      d.trail,
      ruleAttr(ctx, "", gone ?? spacerDecls(d.trail, m?.trail))
    );
  } else if (m && m.trail > ROW_TOLERANCE) {
    trailCell = phantomSpacer(ctx, m.trail);
  }
  if (m) {
    row.forEach((child, index) => {
      if (m.pinned[index]) {
        if (!d.pinned[index] || m.widths[index] !== d.widths[index]) {
          cellDecls[index].push(`width:${m.widths[index]}px`);
        }
      } else if (d.pinned[index]) {
        cellDecls[index].push("width:auto");
      }
    });
  }
  // A cell that gained padding (a spacer the desktop row lacks) must not also pin a width:
  // under a client's border-box reset the padding would eat the content (a 40px logo cell
  // with 295px of padding rendered 0 wide). A LONE cell fills its row with `width:auto` —
  // the paddings set the content width, and auto cancels the desktop `width="N"` attribute
  // that would otherwise still apply; a padded cell sharing a row keeps its width and pins
  // the box model explicitly.
  cellDecls.forEach((decls) => {
    const padded = decls.some((decl) => decl.startsWith("padding-"));
    const widthAt = decls.findIndex((decl) => decl.startsWith("width:"));
    if (!padded || widthAt < 0) return;
    if (row.length === 1) decls[widthAt] = "width:auto";
    else decls.push("box-sizing:content-box");
  });

  const cells: string[] = leadCell ? [leadCell] : [];
  row.forEach((child, index) => {
    if (gapCells[index]) cells.push(gapCells[index]);
    const valign = deriveValign(child, bandTop, bandBottom);
    const widthAttr = d.pinned[index] ? ` width="${d.widths[index]}"` : "";
    const attrs = ruleAttr(ctx, "", cellDecls[index]);
    // Is the child a banner that must shrink with a narrow phone, or a logo/icon that must
    // hold its width so the row's spacers give way instead? Judged against the MOBILE
    // email's content width, not the immediate wrapper (a 36px logo fills its 36px link
    // wrapper, yet is no banner): three quarters of the email width counts as filling it —
    // anything that wide would overflow a small phone. Without a mobile render (a
    // desktop-only email) every image stays fluid, as before.
    const twin = mRow ? mRow[index] : undefined;
    const fluid = ctx
      ? (twin ?? child).rect.width >= ctx.mobileContentWidth * 0.75
      : true;
    cells.push(
      `<td${attrs}${widthAttr} valign="${valign}">${emitChild(
        child,
        twin,
        fluid
      )}</td>`
    );
  });
  if (trailCell) cells.push(trailCell);
  return `<tr>${cells.join("")}</tr>`;
};

/**
 * Emit a container node as a nested presentation table. `width` defaults to the node's own
 * measured width; the root passes the email's content width explicitly (see {@link emit}).
 */
const emitContainer = (
  node: MeasuredNode,
  width: number,
  emitChild: ChildEmitter,
  mobile?: MeasuredNode,
  ctx?: OverrideCtx,
  mobileWidth?: number
): string => {
  const rows = bucketRows(node.children);
  // Each desktop child pairs with its mobile TWIN by reading order — compatible() guaranteed
  // the sequences match for a section, and the root's children (the sections) pair the same
  // way. A desktop row's twins may sit in one mobile row or stack one per row; either way
  // the row's mobile top/bottom come from the twins' rects. Anything unpaired gets no rules
  // rather than wrong ones.
  const seqM = ctx && mobile ? sequence(mobile) : undefined;
  const twinRows =
    seqM && seqM.length === node.children.length
      ? (() => {
          const seqD = rows.flat();
          const twinOf = new Map(seqD.map((child, i) => [child, seqM[i]]));
          return rows.map((row) =>
            row.map((child) => twinOf.get(child) as MeasuredNode)
          );
        })()
      : undefined;

  // Vertical spacing. A spacer row the desktop has gets a rule (new height, or gone); the
  // spacing the desktop LACKS but mobile has becomes padding on the neighbouring row's
  // wrapper cell. Computed first so wrapper cells know their rule when they're emitted.
  const vDecls = (
    desktopPx: number,
    mobilePx: number | undefined
  ): string[] => {
    if (mobilePx === undefined) return [];
    if (mobilePx <= ROW_TOLERANCE) return ["display:none"];
    return round(mobilePx) !== round(desktopPx)
      ? [`height:${round(mobilePx)}px`]
      : [];
  };
  const wrapDecls: string[][] = rows.map(() => []);
  const gapRows: string[] = rows.map(() => "");
  let padTopRow = "";
  let padBottomRow = "";
  if (rows.length > 0) {
    const last = rows.length - 1;
    // Top padding (space above the first child).
    const padTop = rowTop(rows[0]) - node.rect.y;
    const padTopM =
      twinRows && mobile ? rowTop(twinRows[0]) - mobile.rect.y : undefined;
    if (padTop > ROW_TOLERANCE) {
      padTopRow = spacerRow(padTop, ruleAttr(ctx, "", vDecls(padTop, padTopM)));
    } else if (padTopM !== undefined && padTopM > ROW_TOLERANCE) {
      wrapDecls[0].push(`padding-top:${round(padTopM)}px`);
    }
    // Gaps between rows.
    rows.forEach((row, index) => {
      if (index === 0) return;
      const gap = rowTop(row) - rowBottom(rows[index - 1]);
      const gapM = twinRows
        ? Math.max(rowTop(twinRows[index]) - rowBottom(twinRows[index - 1]), 0)
        : undefined;
      if (gap > 0) {
        gapRows[index] = spacerRow(gap, ruleAttr(ctx, "", vDecls(gap, gapM)));
      } else if (gapM !== undefined && gapM > ROW_TOLERANCE) {
        wrapDecls[index].push(`padding-top:${round(gapM)}px`);
      }
    });
    // Bottom padding (space below the last child).
    const padBottom = node.rect.y + node.rect.height - rowBottom(rows[last]);
    const padBottomM =
      twinRows && mobile
        ? mobile.rect.y + mobile.rect.height - rowBottom(twinRows[last])
        : undefined;
    if (padBottom > ROW_TOLERANCE) {
      padBottomRow = spacerRow(
        padBottom,
        ruleAttr(ctx, "", vDecls(padBottom, padBottomM))
      );
    } else if (padBottomM !== undefined && padBottomM > ROW_TOLERANCE) {
      wrapDecls[last].push(`padding-bottom:${round(padBottomM)}px`);
    }
  }

  const body: string[] = [];
  if (padTopRow) body.push(padTopRow);
  rows.forEach((row, index) => {
    if (gapRows[index]) body.push(gapRows[index]);
    // Each row gets its OWN table. In an HTML table every row shares one column grid, so
    // rows shaped [40|520|40] and [262|77|261] would be reconciled into a single grid whose
    // columns sum past the width, shrinking every cell (a 520px paragraph rendered at 327px
    // and wrapped word-per-line). Stacking one single-row table per row inside this
    // single-column table keeps each row's measured widths intact.
    const wrapAttr = ruleAttr(ctx, "", wrapDecls[index]);
    body.push(
      `<tr><td${wrapAttr}><table role="presentation" border="0" cellpadding="0"` +
        ` cellspacing="0" width="100%" style="border-collapse: collapse; width: 100%;">` +
        `<tbody>${emitRow(
          row,
          node,
          emitChild,
          ctx,
          twinRows ? twinRows[index] : undefined,
          twinRows ? mobile : undefined
        )}</tbody></table></td></tr>`
    );
  });
  if (padBottomRow) body.push(padBottomRow);

  // Fluid: width:100% capped at the measured px, so it holds the measured width on desktop
  // but shrinks on a narrow (non-Outlook) client instead of forcing a min-width the viewport
  // can't honour. Outlook is pinned to the desktop copy by the two-layout toggle. A measured
  // background image rides along with its size/position/repeat (styleString normalises the
  // url("…") quotes to url('…'), which stays valid inside the style attribute).
  // Collapsed borders make a table IGNORE border-radius, so a rounded or bordered wrapper
  // (the outlined "See more" pill) rendered with square corners. Such a wrapper uses
  // separate borders; with zero spacing (cellspacing="0" too) the layout is identical.
  const outlined = !!(node.styles.borderRadius || node.styles.borderTop);
  const tableStyle = styleString([
    ["border-collapse", outlined ? "separate" : "collapse"],
    ["border-spacing", outlined ? "0" : undefined],
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
  // The mobile measurement's width caps the table on mobile (the root: the mobile content
  // width) — the one container-level number that changes between breakpoints.
  const mobileMax =
    ctx && mobile ? Math.ceil(mobileWidth ?? mobile.rect.width) : undefined;
  const tableDecls =
    mobileMax !== undefined && mobileMax !== Math.ceil(width)
      ? [`max-width:${mobileMax}px`]
      : [];
  const table =
    `<table${ruleAttr(
      ctx,
      node.id,
      tableDecls
    )} role="presentation" border="0"` +
    ` cellpadding="0" cellspacing="0" width="100%" style="${tableStyle}">` +
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

export interface CompiledBody {
  /** The email body: nested tables. */
  body: string;
  /** The measured `@media` block for it, or "" without a mobile render. */
  mediaCss: string;
}

/**
 * Compile the email body (nested tables) from the desktop MeasuredTree, plus its mobile
 * `@media` block. With a mobile MeasuredTree, each top-level section that keeps its
 * structure on mobile is emitted once with id-keyed override rules (see the Responsive
 * notes above); a section that restacks is emitted as two layouts, and the block then also
 * carries the toggle that swaps them. Without a mobile tree the output is the plain desktop
 * layout and no block. Sections pair by POSITION: the root's children are the placed
 * components in order (their wrapper ids repeat, so ids can't pair them), and both trees
 * hold the same components in the same order. Chrome (outer shell, head, MSO conditionals)
 * is wrapped around this separately. The breakpoint sits just under the desktop content
 * width so a viewport at exactly it still shows desktop (max-width is inclusive).
 */
export const compileBody = (
  desktop: MeasuredTree,
  mobile?: MeasuredTree
): CompiledBody => {
  if (!mobile || mobile.root.children.length === 0) {
    return {
      body: emitContainer(
        desktop.root,
        desktop.contentWidth,
        makeChildEmitter()
      ),
      mediaCss: "",
    };
  }
  let counter = 0;
  const ctx: OverrideCtx = {
    rules: [],
    nextId: () => `m${++counter}`,
    mobileContentWidth: mobile.contentWidth,
  };
  const overridden = makeChildEmitter(ctx);
  const plain = makeChildEmitter();
  let restacks = false;
  const mobileSections = mobile.root.children;
  let position = 0;
  const emitSection: ChildEmitter = (node) => {
    const counterpart = mobileSections[position++];
    if (!isContainer(node) || !counterpart) return plain(node);
    if (compatible(node, counterpart)) return overridden(node, counterpart);
    restacks = true;
    return twoLayout(
      emitContainer(node, node.rect.width, plain),
      emitContainer(counterpart, counterpart.rect.width, plain)
    );
  };
  const body = emitContainer(
    desktop.root,
    desktop.contentWidth,
    emitSection,
    mobile.root,
    ctx,
    mobile.contentWidth
  );
  const breakpoint = round(desktop.contentWidth) - 1;
  const lines = [
    ...(restacks
      ? [
          `  .${D_CLASS} { display: none !important; }`,
          `  .${M_CLASS} { display: block !important; }`,
        ]
      : []),
    ...ctx.rules.map((rule) => `  ${rule}`),
  ];
  const mediaCss =
    lines.length === 0
      ? ""
      : `@media screen and (max-width: ${breakpoint}px) {\n${lines.join(
          "\n"
        )}\n}`;
  return { body, mediaCss };
};

/** The compiled body alone (see compileBody). */
export const emit = (desktop: MeasuredTree, mobile?: MeasuredTree): string =>
  compileBody(desktop, mobile).body;

/** The measured `@media` block alone (see compileBody). */
export const collectMediaQuery = (
  desktop: MeasuredTree,
  mobile?: MeasuredTree
): string => compileBody(desktop, mobile).mediaCss;

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

import { MeasuredNode, MeasuredStyles, MeasuredTree } from "./measured-tree";

// The emitter: a pure `MeasuredTree -> Compiled email body` function. It transcribes
// measured geometry into email-safe nested tables — it never guesses layout from CSS
// rules (ADR-0004). Everything here is derived from the numbers measurement observed:
//   - column widths  = measured element widths
//   - row grouping   = children bucketed by measured vertical overlap
//   - alignment      = derived from a child's measured x-offset within its parent
//   - gaps           = measured pixel distance between boxes
// No VML, no mobile @media, no dark-mode handling yet — those arrive in later tickets.
// This function stays browser-free so it can be unit-tested against synthetic fixtures.

/** Boxes within this many px of each other vertically count as the same row. */
const ROW_TOLERANCE = 4;
/** Left/right gaps within this many px of each other count as centered. */
const ALIGN_TOLERANCE = 4;

const round = (n: number): number => Math.round(n);

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttr = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Build an inline style string from ordered [prop, value] pairs, skipping empties. */
const styleString = (pairs: Array<[string, string | undefined]>): string =>
  pairs
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([prop, value]) => `${prop}: ${value};`)
    .join(" ");

const fontStyle = (styles: MeasuredStyles): string =>
  styleString([
    ["font-family", styles.fontFamily],
    ["font-size", styles.fontSize],
    ["font-weight", styles.fontWeight],
    ["line-height", styles.lineHeight],
    ["color", styles.color],
    ["text-align", styles.textAlign],
  ]);

const buttonStyle = (styles: MeasuredStyles): string =>
  styleString([
    ["display", "inline-block"],
    ["background-color", styles.backgroundColor],
    ["color", styles.color],
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

const idAttr = (id: string): string => (id ? ` id="${escapeAttr(id)}"` : "");

/** Emit a leaf node (text / image / button) as cell content. */
const emitLeaf = (node: MeasuredNode): string => {
  switch (node.role) {
    case "image": {
      const style = styleString([["display", "block"]]);
      return (
        `<img${idAttr(node.id)} src="${escapeAttr(node.src || "")}"` +
        ` width="${round(node.rect.width)}" height="${round(
          node.rect.height
        )}"` +
        ` alt="${escapeAttr(node.alt || "")}" style="${style}" />`
      );
    }
    case "button": {
      const href = node.href ? ` href="${escapeAttr(node.href)}"` : "";
      return (
        `<a${idAttr(node.id)}${href} style="${buttonStyle(node.styles)}">` +
        `${escapeHtml(node.text || "")}</a>`
      );
    }
    case "text":
    default: {
      const style = fontStyle(node.styles);
      const styleAttr = style ? ` style="${style}"` : "";
      return `<div${idAttr(node.id)}${styleAttr}>${escapeHtml(
        node.text || ""
      )}</div>`;
    }
  }
};

/** Content for one child: a nested table for containers, cell content for leaves. */
const emitChild = (node: MeasuredNode): string =>
  node.children.length > 0 && node.role !== "text"
    ? emitContainer(node)
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

/** Emit a single row of columns, with measured horizontal gap spacers between them. */
const emitRow = (row: MeasuredNode[], parent: MeasuredNode): string => {
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

  const cells: string[] = [];
  row.forEach((child, index) => {
    if (index > 0) {
      const gap =
        child.rect.x - (row[index - 1].rect.x + row[index - 1].rect.width);
      if (gap > 0) cells.push(spacerCell("width", gap));
    }
    cells.push(
      `<td width="${round(child.rect.width)}" valign="top">${emitChild(
        child
      )}</td>`
    );
  });
  return `<tr>${cells.join("")}</tr>`;
};

/**
 * Emit a container node as a nested presentation table. `width` defaults to the node's own
 * measured width; the root passes the email's content width explicitly (see {@link emit}).
 */
const emitContainer = (node: MeasuredNode, width = node.rect.width): string => {
  const rows = bucketRows(node.children);
  const body: string[] = [];
  rows.forEach((row, index) => {
    if (index > 0) {
      const gap = rowTop(row) - rowBottom(rows[index - 1]);
      if (gap > 0) body.push(spacerRow(gap));
    }
    body.push(emitRow(row, node));
  });

  const tableStyle = styleString([
    ["border-collapse", "collapse"],
    ["background-color", node.styles.backgroundColor],
  ]);
  return (
    `<table${idAttr(node.id)} role="presentation" border="0" cellpadding="0"` +
    ` cellspacing="0" width="${round(width)}" style="${tableStyle}">` +
    `<tbody>${body.join("")}</tbody></table>`
  );
};

/**
 * Emit the Compiled email body (nested tables) from a MeasuredTree. The outer table is
 * baked to the measured content width — the email's column width. Chrome (the outer shell,
 * head, MSO conditionals) is wrapped around this separately — see html.ts.
 */
export const emit = (tree: MeasuredTree): string =>
  emitContainer(tree.root, tree.contentWidth);

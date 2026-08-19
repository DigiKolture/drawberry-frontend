// The MeasuredTree is the boundary between measurement (browser-bound: reads real
// geometry + computed styles off the rendered Canvas) and the emitter (pure logic that
// transcribes geometry into email-safe tables). It is the primary test seam for the
// compile pipeline — the emitter is unit-tested against synthetic MeasuredTree fixtures,
// no browser required. See ADR-0004 (compile by measuring) and ADR-0005 (frontend is the
// sole producer). Keep this a plain data shape: no methods, nothing browser-specific.

/** A box's measured geometry, in CSS px, relative to the Canvas content box (the root). */
export interface MeasuredRect {
  /** Left offset from the root's left edge. */
  x: number;
  /** Top offset from the root's top edge. */
  y: number;
  width: number;
  height: number;
}

/**
 * What a node is, for emission purposes. Containers get laid out as tables (their
 * children bucketed into rows by measured y, columns by measured x/width); leaves become
 * cell content. Measurement assigns the role so the emitter never has to re-derive it.
 */
export type MeasuredRole =
  | "root" // the outermost container — the whole email body
  | "container" // a box with children, emitted as a nested table
  | "text" // a text leaf; emitted with baked font styles but auto-height
  | "image" // an <img> leaf; emitted with measured width/height
  | "button" // a call-to-action leaf; emitted as a padded, coloured link cell
  | "box"; // a childless, textless visual block (divider, colour bar, spacer) — emitted
//         with its measured height + background so it doesn't collapse

/**
 * A curated subset of computed styles the emitter bakes into the tables. Only what the
 * emitter actually reads belongs here — measurement stays thin. Values are the raw
 * computed-style strings (e.g. "16px", "rgb(0, 0, 0)").
 */
export interface MeasuredStyles {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: string;
  borderRadius?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
}

export interface MeasuredNode {
  /** The rendered DOM id, so a node is traceable back to the element it measured. */
  id: string;
  role: MeasuredRole;
  rect: MeasuredRect;
  styles: MeasuredStyles;
  /** Text leaves only. */
  text?: string;
  /** Buttons and any linked leaf. */
  href?: string;
  /** Images only. */
  src?: string;
  alt?: string;
  children: MeasuredNode[];
}

export interface MeasuredTree {
  /** The measured Canvas content width — email column width, in px. */
  contentWidth: number;
  root: MeasuredNode;
}

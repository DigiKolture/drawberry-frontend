import { test, expect, Page } from "@playwright/test";
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";

// Stock-component fidelity golden. The synthetic fixtures in desktop-fidelity.spec.ts cover
// layout *patterns*; this suite covers the REAL catalog: eight stock components exactly as a
// project stores them (defaultHtml + per-breakpoint json), rendered the way the Canvas
// renders them, compiled by the real measure+emit, and diffed element-by-element against
// the Canvas render — geometry AND the computed text styles — at desktop and at the mobile
// breakpoint. It exists because the synthetic suite passed while real components failed
// (rows sharing a column grid, sub-pixel wraps, dropped letter-spacing): the catalog uses
// CSS the hand-written fixtures never modelled. Zero mismatches is the bar, both widths.
//
// Fixture: tests/golden/fixtures/stock-components.json — regenerate from a project's stored
// `project-components` (defaultHtml + json) when the catalog changes.

test.setTimeout(90_000); // three page loads with remote fonts/images per mobile pass

const FE = path.resolve(__dirname, "../..");
const COMPILE_DIR = path.join(FE, "src/composables/canvas/compile");
const FIXTURE = path.join(__dirname, "fixtures/stock-components.json");

const transpile = (file: string): string =>
  ts.transpileModule(fs.readFileSync(path.join(COMPILE_DIR, file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;
const wrap = (js: string): string =>
  `;(function(){var require=function(){return {};};var exports={};var module={exports:exports};` +
  `${js};for(var k in exports){window.__compile[k]=exports[k];}})();`;
const BUNDLE =
  `window.__compile=window.__compile||{};` +
  wrap(transpile("measure.ts")) +
  wrap(transpile("emit.ts"));

/** Tailwind's preflight reset applies on the Canvas (`@tailwind base`); the render must match. */
const preflight = (): string => {
  const file = ["src/css/preflight.css", "lib/css/preflight.css"]
    .map((f) => path.join(FE, "node_modules/tailwindcss", f))
    .find(fs.existsSync);
  if (!file) throw new Error("tailwind preflight.css not found");
  // Resolve theme(...) calls to their fallback value; the resets we need don't use them.
  return fs
    .readFileSync(file, "utf8")
    .replace(/theme\(([^)]*)\)/g, (m, inner) => {
      const i = inner.indexOf(",");
      return i > 0 ? inner.slice(i + 1).trim() : "inherit";
    });
};

// The Canvas content widths per breakpoint (workspace.css / canvas.css).
const DESKTOP_WIDTH = 600;
const MOBILE_WIDTH = 367;
// What the email chrome actually gives the mobile copy on a 375px phone: its outer cell
// carries 10px side gutters (wrapInChrome), so 375 - 20. Narrower than the Canvas measured.
const CHROME_MOBILE_WIDTH = 355;
type Breakpoint = "desktop" | "mobile";

/**
 * Port of update_dom.updateElementDom for one breakpoint: attribute whitelist, style
 * flatten (`mobile ?? desktop`), bgcolor, background image, leaf text, visibility. Stock
 * components carry no duplicates/removals, so per-element application equals
 * arrangeElementsInComponentHTML.
 */
const ATTRS: Record<string, string[]> = {
  td: ["valign", "align", "background", "height"],
  img: ["src"],
  a: ["href"],
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyJson = (html: string, json: any[], bp: Breakpoint): string => {
  const $ = cheerio.load(html);
  for (const ej of json) {
    const el = $("#" + ej.id);
    if (!el.length) continue;
    const tag = String(el.prop("tagName") || "").toLowerCase();
    const attrs = ej.attributes || {};
    for (const a of ATTRS[tag] || []) {
      if (attrs[a] && attrs[a].value != null)
        el.attr(a, String(attrs[a].value));
    }
    const style = attrs.style && attrs.style.value;
    const flat: Record<string, string> = {};
    if (style) {
      for (const [k, v] of Object.entries<Record<string, unknown>>(style)) {
        const val = v[bp] ?? v.desktop ?? "";
        flat[k] = val == null ? "" : String(val);
      }
    }
    if (flat["background-color"]) el.attr("bgcolor", flat["background-color"]);
    if (attrs.background && attrs.background.value) {
      flat["background-image"] = `url(${attrs.background.value})`;
    }
    for (const [k, v] of Object.entries(flat)) el.css(k, v);
    const types: string[] = ej.types || ej.classes || [];
    if (
      types.includes("text") &&
      el.children().length === 0 &&
      ej.textContent != null
    ) {
      el.html(ej.textContent);
    }
    if (ej.visibility === "none") el.css("display", "none");
    else if (ej.visibility === "ghost") el.css("visibility", "hidden");
  }
  return $.html();
};

interface Fixture {
  name: string;
  defaultHtml: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any[];
}
const fixtures: Fixture[] = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));

const fontLinks = (html: string): string => {
  const families = [
    ...new Set(
      [...html.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1])
    ),
  ];
  return families
    .map(
      (f) =>
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          f
        ).replace(/%20/g, "+")}:wght@300;400;500;600;700;800&display=swap">`
    )
    .join("");
};

/** The Canvas as it renders at a breakpoint: preflight + the container structure + fonts. */
const canvasDoc = (bp: Breakpoint): string => {
  const width = bp === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH;
  const items = fixtures
    .map(
      (f, i) =>
        `<div class="workspace__component__items__list">` +
        `<div class="workspace__component__items__list__item" id="workspace-component-item-${i}">` +
        `${applyJson(f.defaultHtml, f.json, bp)}</div></div>`
    )
    .join("");
  return (
    `<!doctype html><html><head><meta charset="utf-8">${fontLinks(
      items
    )}<style>${preflight()}` +
    `#canvas-workspace-items-container{display:flex;flex-direction:column;align-items:center;width:${width}px;}` +
    `.workspace__component__items__list{width:100%;position:relative;}` +
    `.workspace__component__items__list__item{width:100%;position:relative;}` +
    `</style></head><body style="margin:0"><div id="canvas-workspace-items-container">${items}</div></body></html>`
  );
};

/** The emitted tables, bare — as an email client renders them — at a given column width. */
const tablesDoc = (
  body: string,
  media: string,
  width: number,
  fonts: string
): string =>
  `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${media}</style></head>` +
  `<body style="margin:0"><div style="width:${width}px">${body}</div></body></html>`;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  leaf: boolean;
  text: string;
  tag: string;
  fw: string;
  ls: string;
  fs: string;
  lh: string;
  color: string;
  ta: string;
  ff: string;
  bg: string;
  bgi: boolean;
  br: string;
  /** Top border width + colour (an outlined "See more" pill, a bordered button). */
  bw: string;
  bc: string;
}

/** Every visible id'd element under the root: box relative to the root + the styles we bake. */
const measure = (): Record<string, Box> => {
  const root = document.getElementById(
    "canvas-workspace-items-container"
  ) as HTMLElement;
  const base = root.getBoundingClientRect();
  const out: Record<string, Box> = {};
  root.querySelectorAll("[id]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return; // the hidden copy of a two-layout section
    const cs = getComputedStyle(el);
    const leaf = el.children.length === 0 && el.tagName !== "IMG";
    out[(el as HTMLElement).id] = {
      x: Math.round(r.left - base.left),
      y: Math.round(r.top - base.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
      leaf,
      text: leaf ? (el.textContent || "").trim().slice(0, 30) : "",
      tag: el.tagName,
      fw: cs.fontWeight,
      ls: cs.letterSpacing,
      fs: cs.fontSize,
      lh: cs.lineHeight,
      color: cs.color,
      ta: cs.textAlign,
      ff: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
      bg: cs.backgroundColor,
      bgi: cs.backgroundImage !== "none",
      br: cs.borderRadius,
      bw: cs.borderTopWidth,
      bc: cs.borderTopColor,
    };
  });
  return out;
};

const POS = 5;
const SIZE = 10;
// Force light (ADR-0006) nudges pure white/black to #fffffe/#010101 on purpose.
const norm = (v: string): string =>
  v
    .replace("rgb(255, 255, 254)", "rgb(255, 255, 255)")
    .replace("rgb(1, 1, 1)", "rgb(0, 0, 0)");

/** Element-by-element diff of the Canvas render against the compiled tables. */
const compare = (
  canvas: Record<string, Box>,
  tables: Record<string, Box>
): string[] => {
  const issues: string[] = [];
  for (const [id, c] of Object.entries(canvas)) {
    if (/^workspace/.test(id) || id === "canvas-workspace-items-container")
      continue;
    const t = tables[id];
    const found: string[] = [];
    if (!t) {
      // A button's inner link is absorbed into the button leaf (its id lands on the <a>).
      if (!(/[bB]uttonLink$/.test(id) && tables[id.replace(/Link$/, "")])) {
        found.push("MISSING in tables");
      }
    } else {
      if (Math.abs(c.x - t.x) > POS) found.push(`x ${c.x}->${t.x}`);
      if (Math.abs(c.y - t.y) > POS) found.push(`y ${c.y}->${t.y}`);
      if (Math.abs(c.w - t.w) > SIZE) found.push(`w ${c.w}->${t.w}`);
      if (Math.abs(c.h - t.h) > SIZE) found.push(`h ${c.h}->${t.h}`);
      if (c.leaf && c.text) {
        for (const k of [
          "fw",
          "ls",
          "fs",
          "lh",
          "color",
          "ta",
          "ff",
        ] as const) {
          if (norm(c[k]) !== norm(t[k])) found.push(`${k} ${c[k]}->${t[k]}`);
        }
      }
      if (norm(c.bg) !== norm(t.bg) && c.bg !== "rgba(0, 0, 0, 0)") {
        found.push(`bg ${c.bg}->${t.bg}`);
      }
      if (c.bgi && !t.bgi) found.push("background-image DROPPED");
      if (c.br !== t.br && c.br !== "0px" && c.tag !== "A")
        found.push(`radius ${c.br}->${t.br}`);
      // A visible border on the Canvas must survive (an outlined pill, a bordered button).
      if (c.bw !== "0px" && (c.bw !== t.bw || norm(c.bc) !== norm(t.bc))) {
        found.push(`border ${c.bw} ${c.bc}->${t.bw} ${t.bc}`);
      }
    }
    if (found.length)
      issues.push(`${id}${c.text ? ` "${c.text}"` : ""}: ${found.join(", ")}`);
  }
  return issues;
};

const load = async (page: Page, html: string): Promise<void> => {
  await page
    .setContent(html, { waitUntil: "load", timeout: 30_000 })
    .catch(() => undefined);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
};

const FONTS = fontLinks(fixtures.map((f) => f.defaultHtml).join(""));

test("stock components: the desktop compile matches the Canvas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 1400 });
  await load(page, canvasDoc("desktop"));
  await page.addScriptTag({ content: BUNDLE });
  const canvas = await page.evaluate(measure);
  const body: string = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = (window as any).__compile;
    return c.emit(c.measureCanvas());
  });
  await load(page, tablesDoc(body, "", DESKTOP_WIDTH, FONTS));
  const tables = await page.evaluate(measure);
  const issues = compare(canvas, tables);
  expect(issues, `desktop mismatches:\n${issues.join("\n")}`).toEqual([]);
});

test("stock components: the mobile compile matches the Canvas at the mobile breakpoint", async ({
  page,
}) => {
  // Desktop tree, exactly as compile.ts measures it first…
  await page.setViewportSize({ width: 900, height: 1400 });
  await load(page, canvasDoc("desktop"));
  await page.addScriptTag({ content: BUNDLE });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const desktopTree = await page.evaluate(() =>
    (window as any).__compile.measureCanvas()
  );
  // …then the Canvas re-rendered at the mobile breakpoint (json mobile values, 367px).
  await load(page, canvasDoc("mobile"));
  await page.addScriptTag({ content: BUNDLE });
  const canvasMobile = await page.evaluate(measure);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mobileTree = await page.evaluate(() =>
    (window as any).__compile.measureCanvas()
  );
  const { body, media } = await page.evaluate(
    ([d, m]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = (window as any).__compile;
      return {
        body: c.emit(d, m) as string,
        media: c.collectMediaQuery(d, m) as string,
      };
    },
    [desktopTree, mobileTree]
  );
  // A phone-width viewport so the email's own @media selects the mobile copy.
  await page.setViewportSize({ width: 375, height: 1400 });
  await load(page, tablesDoc(body, media, MOBILE_WIDTH, FONTS));
  const tables = await page.evaluate(measure);
  const issues = compare(canvasMobile, tables);
  expect(issues, `mobile mismatches:\n${issues.join("\n")}`).toEqual([]);
});

test("stock components: the mobile copy survives the chrome's narrower width without wrapping", async ({
  page,
}) => {
  // The chrome's gutters give the mobile copy 355px on a 375px phone, not the 367px it was
  // measured at (and phones go down to 320). A squeezed row shrinks every cell a few percent;
  // nothing that was ONE line on the Canvas may wrap for that (buttons, labels, titles).
  // Height is the tell: an extra line doubles it. Paragraphs may reflow; they aren't checked.
  await page.setViewportSize({ width: 900, height: 1400 });
  await load(page, canvasDoc("desktop"));
  await page.addScriptTag({ content: BUNDLE });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const desktopTree = await page.evaluate(() =>
    (window as any).__compile.measureCanvas()
  );
  await load(page, canvasDoc("mobile"));
  await page.addScriptTag({ content: BUNDLE });
  const canvasMobile = await page.evaluate(measure);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mobileTree = await page.evaluate(() =>
    (window as any).__compile.measureCanvas()
  );
  const { body, media } = await page.evaluate(
    ([d, m]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = (window as any).__compile;
      return {
        body: c.emit(d, m) as string,
        media: c.collectMediaQuery(d, m) as string,
      };
    },
    [desktopTree, mobileTree]
  );
  // Three phone classes: a 375 iPhone, a 360 Android, a 320 iPhone SE — each minus the
  // chrome's 20px of gutters. If the mobile copy survives 300px it survives everything above.
  for (const [phone, width] of [
    [375, CHROME_MOBILE_WIDTH],
    [360, 340],
    [320, 300],
  ] as const) {
    await page.setViewportSize({ width: phone, height: 1400 });
    await load(page, tablesDoc(body, media, width, FONTS));
    const tables = await page.evaluate(measure);
    const broken: string[] = [];
    for (const [id, c] of Object.entries(canvasMobile)) {
      const t = tables[id];
      if (!t) continue;
      // An image must shrink proportionally, never warp: with only a height attribute a
      // squeezed logo kept its 40px height and collapsed to a sliver.
      if (c.tag === "IMG" && c.w > 0 && c.h > 0) {
        const ratio = c.h / c.w;
        const got = t.w > 0 ? t.h / t.w : Infinity;
        if (t.w === 0 || Math.abs(got - ratio) > ratio * 0.05) {
          broken.push(`${id}: image ${c.w}x${c.h} -> ${t.w}x${t.h}`);
        }
        continue;
      }
      // A button's Canvas node is a wrapper (not a leaf) while its emitted <a> is a leaf, so
      // accept either side as the text carrier; a single Canvas line is height <= line-height.
      const text = c.text || t.text;
      if (!text) continue;
      const lineHeight = parseFloat(c.lh);
      const singleLine = !Number.isNaN(lineHeight) && c.h <= lineHeight + 4;
      if (singleLine && t.h > c.h + 4) {
        broken.push(`${id} "${text}": h ${c.h}->${t.h}`);
      }
    }
    expect(
      broken,
      `broken when squeezed to ${width}px (a ${phone}px phone):\n${broken.join(
        "\n"
      )}`
    ).toEqual([]);
  }
});

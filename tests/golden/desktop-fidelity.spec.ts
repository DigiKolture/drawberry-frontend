import { test, expect, Page } from "@playwright/test";
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

// Seam 2 — desktop geometric golden-diff. For each representative layout we render the flex
// Canvas, run the REAL measure + emit pipeline in the page, render the emitted tables, and
// assert every element lands in the same place at the same size (within a small pixel
// tolerance). This is the fidelity gate ADR-0004 promises: "matches the Canvas."
//
// measure.ts and emit.ts import only types from measured-tree, so once transpiled they are
// dependency-free; we transpile them with the repo's own TypeScript and expose their exports
// on window.__compile inside the page (no bundler needed).

const COMPILE_DIR = path.resolve(
  __dirname,
  "../../src/composables/canvas/compile"
);

const transpile = (file: string): string =>
  ts.transpileModule(fs.readFileSync(path.join(COMPILE_DIR, file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;

// Wrap each CommonJS module so its `exports.*` land on window.__compile; the type-only
// `require("./measured-tree")` is elided by transpilation, and a no-op require guards anyway.
const wrap = (js: string): string =>
  `;(function(){var require=function(){return {};};var exports={};var module={exports:exports};` +
  `${js};for(var k in exports){window.__compile[k]=exports[k];}})();`;

const COMPILE_BUNDLE =
  `window.__compile=window.__compile||{};` +
  wrap(transpile("measure.ts")) +
  wrap(transpile("emit.ts"));

const CANVAS_ID = "canvas-workspace-items-container";
const WIDTH = 600;

// A neutral, metric-stable font so text-cell heights line up between flex and tables.
const PAGE_STYLE =
  "* { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const flexDoc = (inner: string): string =>
  `<!doctype html><html><head><style>${PAGE_STYLE}</style></head><body>` +
  `<div id="${CANVAS_ID}" style="width:${WIDTH}px;">${inner}</div>` +
  `</body></html>`;

const tablesDoc = (body: string): string =>
  `<!doctype html><html><head><style>${PAGE_STYLE}</style></head><body>` +
  `<div id="tables-root" style="width:${WIDTH}px;">${body}</div>` +
  `</body></html>`;

/** Measure every id'd element's box relative to its container root. */
const measureIds = (
  page: Page,
  rootSel: string
): Promise<Record<string, Rect>> =>
  page.evaluate((sel) => {
    const root = document.querySelector(sel) as HTMLElement;
    const base = root.getBoundingClientRect();
    const out: Record<string, Rect> = {};
    root.querySelectorAll("[id]").forEach((el) => {
      const r = el.getBoundingClientRect();
      out[(el as HTMLElement).id] = {
        x: r.left - base.left,
        y: r.top - base.top,
        width: r.width,
        height: r.height,
      };
    });
    return out;
  }, rootSel);

/** Render flex, compile it in-page, render the emitted tables, return both id→rect maps. */
async function compileAndMeasure(
  page: Page,
  flexInner: string
): Promise<{ flex: Record<string, Rect>; tables: Record<string, Rect> }> {
  await page.setContent(flexDoc(flexInner));
  await page.addScriptTag({ content: COMPILE_BUNDLE });
  // Fail loudly if the transpile-and-inject shim ever stops exposing the pipeline (e.g. a
  // future real runtime import breaks the `require` stub) rather than silently measuring an
  // empty tree.
  const exposed = await page.evaluate(() => {
    const c = (window as any).__compile;
    return !!(
      c &&
      typeof c.measureCanvas === "function" &&
      typeof c.emit === "function"
    );
  });
  expect(exposed, "compile bundle failed to expose measureCanvas/emit").toBe(
    true
  );
  const body: string = await page.evaluate(() => {
    const c = (window as any).__compile;
    const tree = c.measureCanvas();
    return c.emit(tree);
  });
  const flex = await measureIds(page, `#${CANVAS_ID}`);
  await page.setContent(tablesDoc(body));
  const tables = await measureIds(page, "#tables-root");
  return { flex, tables };
}

// Position must match tightly (this is what the centered-button defect broke); sizes get a
// little more slack for font-metric rounding between a flex box and its table cell.
const POS_TOLERANCE = 5;
const SIZE_TOLERANCE = 10;

function expectGeometryMatches(
  flex: Record<string, Rect>,
  tables: Record<string, Rect>,
  ids: string[]
): void {
  for (const id of ids) {
    expect(flex[id], `flex is missing #${id}`).toBeTruthy();
    expect(tables[id], `tables are missing #${id}`).toBeTruthy();
    const f = flex[id];
    const t = tables[id];
    expect(
      Math.abs(f.x - t.x),
      `#${id} x: flex ${f.x} vs table ${t.x}`
    ).toBeLessThanOrEqual(POS_TOLERANCE);
    expect(
      Math.abs(f.y - t.y),
      `#${id} y: flex ${f.y} vs table ${t.y}`
    ).toBeLessThanOrEqual(POS_TOLERANCE);
    expect(
      Math.abs(f.width - t.width),
      `#${id} width: flex ${f.width} vs table ${t.width}`
    ).toBeLessThanOrEqual(SIZE_TOLERANCE);
  }
}

test("single column: stacked blocks keep their vertical positions", async ({
  page,
}) => {
  const flex = `
    <div style="display:flex;flex-direction:column;">
      <div id="title" style="font-size:32px;line-height:40px;">What's New?</div>
      <div id="sub" style="margin-top:20px;font-size:16px;line-height:24px;">Weekly Digest</div>
    </div>`;
  const { flex: f, tables: t } = await compileAndMeasure(page, flex);
  expectGeometryMatches(f, t, ["title", "sub"]);
});

test("multi-column row: two columns stay side by side at measured widths", async ({
  page,
}) => {
  const flex = `
    <div id="row" style="display:flex;justify-content:flex-start;">
      <div id="colA" style="width:290px;height:80px;background:#eee;"></div>
      <div id="gap" style="width:20px;"></div>
      <div id="colB" style="width:290px;height:80px;background:#ddd;"></div>
    </div>`;
  const { flex: f, tables: t } = await compileAndMeasure(page, flex);
  expectGeometryMatches(f, t, ["colA", "colB"]);
  // The defect this guards against: columns collapsing into a vertical stack.
  expect(Math.abs(f.colA.y - f.colB.y)).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(Math.abs(t.colA.y - t.colB.y)).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(t.colB.x).toBeGreaterThan(t.colA.x + 100);
});

test("centered button stays centered (the original reported defect)", async ({
  page,
}) => {
  const flex = `
    <div style="display:flex;justify-content:center;">
      <div id="btn" style="background:#5C9919;border-radius:8px;padding:13px 17px;">
        <a id="btnLink" href="https://example.com" style="display:block;color:#fff;text-decoration:none;font-size:16px;">Shop now</a>
      </div>
    </div>`;
  const { flex: f, tables: t } = await compileAndMeasure(page, flex);
  // The button (id "btn") measures on the Canvas; in the tables its <a> fallback carries the
  // id. Both should be horizontally centred within the 600px column.
  const flexCentre = f.btn.x + f.btn.width / 2;
  const tableCentre = t.btn.x + t.btn.width / 2;
  expect(Math.abs(flexCentre - WIDTH / 2)).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(Math.abs(tableCentre - WIDTH / 2)).toBeLessThanOrEqual(POS_TOLERANCE);
});

test("space-between: edge-pinned children reproduce their measured x positions", async ({
  page,
}) => {
  const flex = `
    <div id="header" style="display:flex;justify-content:space-between;align-items:center;">
      <div id="logo" style="width:120px;height:40px;background:#333;"></div>
      <div id="nav" style="width:160px;height:24px;background:#999;"></div>
    </div>`;
  const { flex: f, tables: t } = await compileAndMeasure(page, flex);
  expectGeometryMatches(f, t, ["logo", "nav"]);
  // nav is pinned to the right edge on the Canvas; the tables must keep it there.
  const flexNavRight = f.nav.x + f.nav.width;
  const tableNavRight = t.nav.x + t.nav.width;
  expect(Math.abs(flexNavRight - WIDTH)).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(Math.abs(tableNavRight - WIDTH)).toBeLessThanOrEqual(POS_TOLERANCE);
});

test("composite banner: a real component's patterns compile together", async ({
  page,
}) => {
  // A catalog-shaped banner exercising several patterns at once — a space-between header
  // (logo + right-pinned nav), stacked heading, and a centred CTA button — so the emitter
  // is validated on a whole component, not just isolated patterns.
  const flex = `
    <div style="display:flex;flex-direction:column;gap:0;padding:0;">
      <div id="header" style="display:flex;justify-content:space-between;align-items:center;">
        <div id="logo" style="width:120px;height:40px;background:#333;"></div>
        <a id="nav" href="https://example.com" style="font-size:16px;line-height:24px;">Menu</a>
      </div>
      <div id="title" style="margin-top:40px;font-size:32px;line-height:40px;">What's New?</div>
      <div style="display:flex;justify-content:center;margin-top:24px;">
        <div id="cta" style="background:#5C9919;border-radius:8px;padding:13px 17px;">
          <a id="ctaLink" href="https://example.com" style="display:block;color:#fff;text-decoration:none;font-size:16px;line-height:20px;">Read more</a>
        </div>
      </div>
    </div>`;
  const { flex: f, tables: t } = await compileAndMeasure(page, flex);
  expectGeometryMatches(f, t, ["logo", "nav", "title"]);
  // logo stays left, nav stays right-pinned, title starts at the left edge, CTA stays centred.
  expect(t.logo.x).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(
    Math.abs(f.nav.x + f.nav.width - (t.nav.x + t.nav.width))
  ).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(t.title.x).toBeLessThanOrEqual(POS_TOLERANCE);
  const ctaCentre = t.cta.x + t.cta.width / 2;
  expect(Math.abs(ctaCentre - WIDTH / 2)).toBeLessThanOrEqual(POS_TOLERANCE);
});

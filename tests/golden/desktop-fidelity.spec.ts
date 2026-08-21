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

const MOBILE_WIDTH = 375;

const flexDoc = (inner: string, width: number = WIDTH): string =>
  `<!doctype html><html><head><style>${PAGE_STYLE}</style></head><body>` +
  `<div id="${CANVAS_ID}" style="width:${width}px;">${inner}</div>` +
  `</body></html>`;

const tablesDoc = (
  body: string,
  width: number = WIDTH,
  mediaCss = ""
): string =>
  `<!doctype html><html><head><style>${PAGE_STYLE}</style>` +
  (mediaCss ? `<style>${mediaCss}</style>` : "") +
  `</head><body>` +
  `<div id="tables-root" style="width:${width}px;">${body}</div>` +
  `</body></html>`;

/**
 * Measure every id'd element's box relative to its container root. The two-layout output
 * has duplicate ids (a desktop copy and a mobile copy), so we record only VISIBLE elements
 * (skip zero-size / display:none) — the copy the current viewport shows wins.
 */
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
      if (r.width === 0 && r.height === 0) return; // hidden copy of a two-layout section
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

test("container padding: a padded space-between header stays flush within its padding", async ({
  page,
}) => {
  // A coloured panel with side padding, directly holding a space-between row — the real
  // header shape. The emitter must reproduce the padding, not collapse the columns to the
  // panel edges.
  const flex = `
    <div id="bg" style="padding:20px 35px;background:#eee;">
      <div id="header" style="display:flex;justify-content:space-between;align-items:center;">
        <div id="logo" style="width:40px;height:40px;background:#333;"></div>
        <div id="social" style="width:108px;height:24px;background:#999;"></div>
      </div>
    </div>`;
  const { flex: f, tables: t } = await compileAndMeasure(page, flex);
  // Logo inset by the left padding; social flush to the right padding edge — matching flex.
  expect(Math.abs(f.logo.x - t.logo.x)).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(
    Math.abs(f.social.x + f.social.width - (t.social.x + t.social.width))
  ).toBeLessThanOrEqual(POS_TOLERANCE);
  // Padding is preserved (not collapsed to the container edges).
  expect(t.logo.x).toBeGreaterThan(20);
  expect(t.social.x + t.social.width).toBeLessThan(WIDTH - 20);
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

// ── Mobile (ticket 03) ────────────────────────────────────────────────────────────────
// @media reacts to the viewport, not the container, so we drive width via the viewport.

/** Render the flex fixture at a viewport width and measure it. */
async function renderFlex(
  page: Page,
  flexInner: string,
  width: number
): Promise<{ tree: any; rects: Record<string, Rect> }> {
  await page.setViewportSize({ width, height: 1400 });
  await page.setContent(flexDoc(flexInner, width));
  await page.addScriptTag({ content: COMPILE_BUNDLE });
  const tree = await page.evaluate(() =>
    (window as any).__compile.measureCanvas()
  );
  const rects = await measureIds(page, `#${CANVAS_ID}`);
  return { tree, rects };
}

/** Render the emitted tables (with the @media block) at a viewport width and measure. */
async function renderTables(
  page: Page,
  body: string,
  mediaCss: string,
  width: number
): Promise<Record<string, Rect>> {
  await page.setViewportSize({ width, height: 1400 });
  await page.setContent(tablesDoc(body, width, mediaCss));
  return measureIds(page, "#tables-root");
}

test("mobile: a multi-column row restacks to one column, desktop unchanged", async ({
  page,
}) => {
  // Two columns that sit side by side at 600 and wrap (stack) at 375 — the flex reflow the
  // compiler must reproduce. Empty coloured boxes keep the fixture layout-pure.
  const flex = `
    <div id="row" style="display:flex;flex-wrap:wrap;align-items:stretch;">
      <div id="colA" style="flex:1 1 280px;min-width:280px;height:80px;background:#eee;"></div>
      <div id="colB" style="flex:1 1 280px;min-width:280px;height:80px;background:#ddd;"></div>
    </div>`;

  const desktop = await renderFlex(page, flex, WIDTH);
  const mobile = await renderFlex(page, flex, MOBILE_WIDTH);

  // Sanity: the flex fixture really does restack (side-by-side desktop, stacked mobile).
  expect(
    Math.abs(desktop.rects.colA.y - desktop.rects.colB.y)
  ).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(mobile.rects.colB.y).toBeGreaterThan(mobile.rects.colA.y + 40);

  const { body, media } = await page.evaluate(
    ([d, m]) => {
      const c = (window as any).__compile;
      return { body: c.emit(d, m), media: c.collectMediaQuery(d, m) };
    },
    [desktop.tree, mobile.tree]
  );
  expect(media).toContain("@media");

  // Desktop tables: columns stay side by side, matching the Canvas.
  const tDesktop = await renderTables(page, body, media, WIDTH);
  expect(Math.abs(tDesktop.colA.y - tDesktop.colB.y)).toBeLessThanOrEqual(
    POS_TOLERANCE
  );
  expect(tDesktop.colB.x).toBeGreaterThan(tDesktop.colA.x + 100);

  // Mobile tables: columns restack to a single column, matching the Canvas mobile layout.
  const tMobile = await renderTables(page, body, media, MOBILE_WIDTH);
  expect(tMobile.colB.y).toBeGreaterThan(tMobile.colA.y + 40);
  expect(Math.abs(tMobile.colA.x - mobile.rects.colA.x)).toBeLessThanOrEqual(
    POS_TOLERANCE
  );
  expect(
    Math.abs(tMobile.colA.width - mobile.rects.colA.width)
  ).toBeLessThanOrEqual(SIZE_TOLERANCE);
});

test("three-column feature stays 3-up on desktop (no 2+1 wrap from rounding)", async ({
  page,
}) => {
  // Three columns that fit exactly in a 560px band on the Canvas (~186.67px each) but stack
  // on mobile. Rounding each column up to 187 sums to 561 > 560 and, as inline-block, the
  // third would wrap to a second row. The emitter must keep them 3-up on desktop.
  const flex = `
    <div id="items" style="display:flex;flex-wrap:wrap;max-width:560px;margin:0 auto;">
      <div id="c1" style="flex:1 1 180px;min-width:180px;height:60px;background:#eee;"></div>
      <div id="c2" style="flex:1 1 180px;min-width:180px;height:60px;background:#ddd;"></div>
      <div id="c3" style="flex:1 1 180px;min-width:180px;height:60px;background:#ccc;"></div>
    </div>`;

  const desktop = await renderFlex(page, flex, WIDTH);
  const mobile = await renderFlex(page, flex, MOBILE_WIDTH);
  // Sanity: 3-up on the desktop Canvas, stacked on mobile.
  expect(
    Math.max(
      Math.abs(desktop.rects.c1.y - desktop.rects.c2.y),
      Math.abs(desktop.rects.c1.y - desktop.rects.c3.y)
    )
  ).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(mobile.rects.c3.y).toBeGreaterThan(mobile.rects.c1.y + 30);

  const { body, media } = await page.evaluate(
    ([d, m]) => {
      const c = (window as any).__compile;
      return { body: c.emit(d, m), media: c.collectMediaQuery(d, m) };
    },
    [desktop.tree, mobile.tree]
  );

  // Desktop tables: all three columns share a row (no 2+1 wrap).
  const t = await renderTables(page, body, media, WIDTH);
  expect(Math.abs(t.c1.y - t.c2.y)).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(Math.abs(t.c1.y - t.c3.y)).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(t.c3.x).toBeGreaterThan(t.c2.x);
});

/**
 * Build the desktop + mobile MeasuredTrees the way compile.ts now does: two measureCanvas()
 * passes over the SAME DOM, first in its desktop state, then re-rendered into its mobile
 * state. In the live app the mobile state is reached by toggling the Canvas breakpoint (which
 * re-renders each component from the per-breakpoint styles in its json); a fixture here
 * declares those mobile deltas as `data-mobile-style` and this helper applies them + narrows
 * the root to reach the identical DOM the toggle would produce. Leaves the page in the mobile
 * state (with the compile bundle loaded).
 */
async function measureDesktopThenMobile(
  page: Page,
  flexInner: string
): Promise<{ desktop: any; mobile: any }> {
  await page.setContent(flexDoc(flexInner, WIDTH));
  await page.addScriptTag({ content: COMPILE_BUNDLE });
  const desktop = await page.evaluate(() =>
    (window as any).__compile.measureCanvas()
  );
  // Re-render into the mobile breakpoint: narrow the root and fold each element's declared
  // mobile deltas onto its inline style, mirroring what the live breakpoint toggle renders.
  await page.evaluate((mobileW) => {
    const root = document.getElementById(
      "canvas-workspace-items-container"
    ) as HTMLElement;
    root.style.width = mobileW + "px";
    root.querySelectorAll("[data-mobile-style]").forEach((el) => {
      const cur = el.getAttribute("style") || "";
      el.setAttribute("style", cur + ";" + el.getAttribute("data-mobile-style"));
    });
  }, MOBILE_WIDTH);
  const mobile = await page.evaluate(() =>
    (window as any).__compile.measureCanvas()
  );
  return { desktop, mobile };
}

test("mobile copy reproduces stacking AND centering (space-between header)", async ({
  page,
}) => {
  // The header2 shape: a space-between row whose mobile styles make each wrapper full-width
  // and centre its content. On mobile the wrappers stack AND the logo/social centre — the
  // exact behaviour the fluid-hybrid approach couldn't reproduce, now driven by measuring the
  // Canvas as its mobile breakpoint actually renders it.
  const flex = `
    <div id="hdr" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;padding:20px 35px;background:#eee;" data-mobile-style="justify-content:center;padding:20px;">
      <div id="logoWrap" style="display:flex;justify-content:flex-start;flex:0 0 auto;" data-mobile-style="width:100%;justify-content:center;">
        <div id="logo" style="width:40px;height:40px;background:#c33;"></div>
      </div>
      <div id="socialWrap" style="display:flex;justify-content:flex-end;flex:0 0 auto;" data-mobile-style="width:100%;justify-content:center;">
        <div id="social" style="width:108px;height:24px;background:#39c;"></div>
      </div>
    </div>`;

  await page.setViewportSize({ width: 900, height: 1200 });
  const { desktop, mobile } = await measureDesktopThenMobile(page, flex);
  const { body, media } = await page.evaluate(
    ([d, m]) => {
      const c = (window as any).__compile;
      return { body: c.emit(d, m), media: c.collectMediaQuery(d, m) };
    },
    [desktop, mobile]
  );
  expect(media).toContain("@media");

  // Desktop: logo left, social right — same row (they differ by a few px because the
  // shorter one is vertically centred), not stacked.
  const tDesktop = await renderTables(page, body, media, WIDTH);
  expect(Math.abs(tDesktop.logo.y - tDesktop.social.y)).toBeLessThanOrEqual(20);
  expect(tDesktop.social.x).toBeGreaterThan(tDesktop.logo.x + 100);

  // Mobile: stacked (logo above social) AND both horizontally centred in the 375px column.
  const tMobile = await renderTables(page, body, media, MOBILE_WIDTH);
  expect(tMobile.social.y).toBeGreaterThan(tMobile.logo.y + 30);
  const logoCentre = tMobile.logo.x + tMobile.logo.width / 2;
  const socialCentre = tMobile.social.x + tMobile.social.width / 2;
  expect(Math.abs(logoCentre - MOBILE_WIDTH / 2)).toBeLessThanOrEqual(10);
  expect(Math.abs(socialCentre - MOBILE_WIDTH / 2)).toBeLessThanOrEqual(10);
});

test("two-pass measure observes the Canvas mobile restacking", async ({
  page,
}) => {
  // The production path: compile measures the Canvas at desktop, then re-measures it at the
  // mobile breakpoint (where these columns stack). Here #row is a flex-row whose mobile styles
  // switch it to a column — the second measureCanvas() pass observes that stack.
  const flex = `
    <div id="row" style="display:flex;flex-direction:row;" data-mobile-style="flex-direction: column;">
      <div id="colA" style="width:300px;height:80px;background:#eee;" data-mobile-style="width:100%;"></div>
      <div id="colB" style="width:300px;height:80px;background:#ddd;" data-mobile-style="width:100%;"></div>
    </div>`;

  await page.setViewportSize({ width: 900, height: 1200 });
  const { desktop, mobile } = await measureDesktopThenMobile(page, flex);

  const r = await page.evaluate(
    ([d, m]) => {
      const c = (window as any).__compile;
      const find = (tree: any, id: string): any => {
        let hit: any = null;
        const walk = (n: any): void => {
          if (n.id === id) hit = n;
          n.children.forEach(walk);
        };
        walk(tree.root);
        return hit;
      };
      return {
        mobileMeasured: m !== null,
        dGapY: Math.abs(find(d, "colA").rect.y - find(d, "colB").rect.y),
        mColAY: find(m, "colA").rect.y,
        mColBY: find(m, "colB").rect.y,
        body: c.emit(d, m),
        media: c.collectMediaQuery(d, m),
      };
    },
    [desktop, mobile]
  );

  expect(r.mobileMeasured).toBe(true);
  // Desktop: side by side. Mobile (re-measured at the mobile breakpoint): stacked.
  expect(r.dGapY).toBeLessThanOrEqual(POS_TOLERANCE);
  expect(r.mColBY).toBeGreaterThan(r.mColAY + 40);
  // ...and that observed stack drives the responsive (two-layout) output.
  expect(r.body).toContain("pc-d");
  expect(r.body).toContain("pc-m");
  expect(r.media).toContain("@media");
});

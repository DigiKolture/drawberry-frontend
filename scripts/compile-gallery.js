#!/usr/bin/env node
/* eslint-env node */
// Compile fidelity gallery — the visual twin of tests/golden/stock-fidelity.spec.ts.
//
// For every stock component in tests/golden/fixtures/stock-components.json, renders the
// Canvas the way the editor does (defaultHtml + per-breakpoint json, Tailwind preflight,
// Google Fonts), compiles it with the REAL measure+emit, renders the emitted tables bare
// (as an email client would), and screenshots all four views — Canvas and compiled email,
// desktop and mobile — into one self-contained page:
//
//   npm run gallery:compile   ->   docs/ui/compile-gallery.html
//
// The golden test diffs these same renders and asserts zero mismatches; this page is for
// eyes. Anything that doesn't look identical here is a gap the test's tolerances miss.
const path = require("path");
const fs = require("fs");
const { chromium } = require("@playwright/test");
const ts = require("typescript");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const FIXTURE = path.join(ROOT, "tests/golden/fixtures/stock-components.json");
const OUT = path.join(ROOT, "docs/ui/compile-gallery.html");
const COMPILE_DIR = path.join(ROOT, "src/composables/canvas/compile");

// The Canvas content widths per breakpoint (workspace.css / canvas.css).
const DESKTOP_WIDTH = 600;
const MOBILE_WIDTH = 367;

const fixtures = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));

// Same transpile-and-inject shim as the golden specs: measure.ts + emit.ts are
// dependency-free once transpiled, exposed on window.__compile inside the page.
const transpile = (file) =>
  ts.transpileModule(fs.readFileSync(path.join(COMPILE_DIR, file), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;
const wrap = (js) =>
  `;(function(){var require=function(){return {};};var exports={};var module={exports:exports};` +
  `${js};for(var k in exports){window.__compile[k]=exports[k];}})();`;
const BUNDLE =
  `window.__compile=window.__compile||{};` +
  wrap(transpile("measure.ts")) +
  wrap(transpile("emit.ts"));

// Tailwind's preflight reset applies on the Canvas (`@tailwind base`); the render must match.
const preflight = () => {
  const file = ["src/css/preflight.css", "lib/css/preflight.css"]
    .map((f) => path.join(ROOT, "node_modules/tailwindcss", f))
    .find(fs.existsSync);
  if (!file) throw new Error("tailwind preflight.css not found");
  return fs
    .readFileSync(file, "utf8")
    .replace(/theme\(([^)]*)\)/g, (m, inner) => {
      const i = inner.indexOf(",");
      return i > 0 ? inner.slice(i + 1).trim() : "inherit";
    });
};

// Port of update_dom.updateElementDom for one breakpoint (see the golden spec).
const ATTRS = {
  td: ["valign", "align", "background", "height"],
  img: ["src"],
  a: ["href"],
};
const applyJson = (html, json, bp) => {
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
    const flat = {};
    if (style) {
      for (const [k, v] of Object.entries(style)) {
        const val = v[bp] ?? v.desktop ?? "";
        flat[k] = val == null ? "" : String(val);
      }
    }
    if (flat["background-color"]) el.attr("bgcolor", flat["background-color"]);
    if (attrs.background && attrs.background.value) {
      flat["background-image"] = `url(${attrs.background.value})`;
    }
    for (const [k, v] of Object.entries(flat)) el.css(k, v);
    const types = ej.types || ej.classes || [];
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

const families = [
  ...new Set(
    fixtures.flatMap((f) =>
      [...f.defaultHtml.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1])
    )
  ),
];
const FONTS = families
  .map(
    (f) =>
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        f
      ).replace(/%20/g, "+")}:wght@300;400;500;600;700;800&display=swap">`
  )
  .join("");

const canvasDoc = (bp) => {
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
    `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${preflight()}` +
    `#canvas-workspace-items-container{display:flex;flex-direction:column;align-items:center;width:${width}px}` +
    `.workspace__component__items__list,.workspace__component__items__list__item{width:100%;position:relative}` +
    `</style></head><body style="margin:0"><div id="canvas-workspace-items-container">${items}</div></body></html>`
  );
};

const tablesDoc = (body, media, width) =>
  `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${media}</style></head>` +
  `<body style="margin:0"><div style="width:${width}px">${body}</div></body></html>`;

const img = (b64, w) =>
  `<img src="data:image/png;base64,${b64}" style="width:${w}px;display:block;border:1px solid #e5e5e5;border-radius:6px">`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 900, height: 1400 },
  });
  const load = async (html) => {
    await page
      .setContent(html, { waitUntil: "load", timeout: 30000 })
      .catch(() => undefined);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
  };
  // One screenshot per component — the visible copy (two-layout hides the other one).
  const shots = async () => {
    const out = [];
    for (let i = 0; i < fixtures.length; i++) {
      const el = page.locator(`#workspace-component-item-${i}:visible`).first();
      out.push((await el.screenshot()).toString("base64"));
    }
    return out;
  };

  await page.setViewportSize({ width: 900, height: 1400 });
  await load(canvasDoc("desktop"));
  await page.addScriptTag({ content: BUNDLE });
  const desktopTree = await page.evaluate(() =>
    window.__compile.measureCanvas()
  );
  const canvasDesktop = await shots();

  await page.setViewportSize({ width: 375, height: 1400 });
  await load(canvasDoc("mobile"));
  await page.addScriptTag({ content: BUNDLE });
  const mobileTree = await page.evaluate(() =>
    window.__compile.measureCanvas()
  );
  const canvasMobile = await shots();

  const { body, media } = await page.evaluate(
    ([d, m]) => ({
      body: window.__compile.emit(d, m),
      media: window.__compile.collectMediaQuery(d, m),
    }),
    [desktopTree, mobileTree]
  );

  await page.setViewportSize({ width: 900, height: 1400 });
  await load(tablesDoc(body, media, DESKTOP_WIDTH));
  const compiledDesktop = await shots();

  await page.setViewportSize({ width: 375, height: 1400 });
  await load(tablesDoc(body, media, MOBILE_WIDTH));
  const compiledMobile = await shots();
  await browser.close();

  const sections = fixtures
    .map(
      (f, i) =>
        `<section><h2>${i + 1}. ${f.name}</h2><div class="grid">` +
        `<figure><figcaption>Canvas · desktop (${DESKTOP_WIDTH})</figcaption>${img(
          canvasDesktop[i],
          300
        )}</figure>` +
        `<figure><figcaption>Compiled email · desktop</figcaption>${img(
          compiledDesktop[i],
          300
        )}</figure>` +
        `<figure><figcaption>Canvas · mobile (${MOBILE_WIDTH})</figcaption>${img(
          canvasMobile[i],
          184
        )}</figure>` +
        `<figure><figcaption>Compiled email · mobile</figcaption>${img(
          compiledMobile[i],
          184
        )}</figure>` +
        `</div></section>`
    )
    .join("");
  const html =
    `<!doctype html><html><head><meta charset="utf-8"><title>Compile fidelity gallery</title><style>` +
    `body{margin:0;background:#f6f6f6;color:#1d1e20;font:14px/1.5 -apple-system,system-ui,sans-serif}` +
    `header{padding:32px 24px 8px;max-width:1120px;margin:0 auto}h1{margin:0 0 6px;font-size:26px}header p{margin:0;color:#666}` +
    `header code{font:12px ui-monospace,monospace;background:#fff;border:1px solid #e5e5e5;border-radius:6px;padding:2px 6px}` +
    `main{max-width:1120px;margin:0 auto;padding:16px 24px 64px}section{background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:18px 20px;margin:16px 0}` +
    `h2{margin:0 0 12px;font-size:16px}.grid{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}figure{margin:0}` +
    `figcaption{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#777;margin-bottom:6px}` +
    `</style></head><body><header><h1>Compile fidelity gallery</h1>` +
    `<p>Each stock component as the Canvas renders it (left of each pair) next to the compiled email (right), at desktop and at the mobile breakpoint. ` +
    `Generated from the same renders the golden tests diff (<code>npm run test:golden</code>). Regenerate: <code>npm run gallery:compile</code></p>` +
    `</header><main>${sections}</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.log(
    `wrote ${path.relative(ROOT, OUT)} (${(html.length / 1024 / 1024).toFixed(
      1
    )}MB, ${fixtures.length} components)`
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

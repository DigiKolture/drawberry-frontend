import * as cheerio from "cheerio";

// The real updateElementDom runs here — only the vuex store is faked, so this exercises
// the same code path a desktop -> mobile -> desktop toggle takes in the canvas.
const breakpoint = { value: "desktop" };

jest.mock("@/store", () => ({
  __esModule: true,
  default: {
    getters: {
      get "canvas/breakpoint"() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return breakpoint.value;
      },
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { arrange } = require("@/composables/canvas/elements/arrange");
const { arrangeElementsInComponentHTML } = arrange();

const PRISTINE_HTML = `
<div component="Banner 1" id="banner1">
  <div id="banner1_background" class="editable">
    <div block id="banner1_headerContainer" class="editable">
      <div id="banner1_logoWrapper" style="flex:0 0 auto;">
        <a id="banner1_logoImageLink" parent="banner1_logoImage" class="editable" href="http://example.com">
          <img id="banner1_logoImage" class="editable" src="logo.png" alt="">
        </a>
      </div>
    </div>
    <div id="banner1_title" block class="editable text">What's New?</div>
  </div>
</div>`;

const el = (id: string, overrides: any = {}) => ({
  id,
  wrapperId: null,
  blockId: null,
  parent: null,
  classes: ["editable"],
  types: [],
  visibility: "show",
  attributes: { style: { value: {} } },
  textContent: "",
  ...overrides,
});

const JSON_DATA = [
  el("banner1_background"),
  el("banner1_headerContainer", { wrapperId: "banner1_background" }),
  el("banner1_logoImageLink", {
    blockId: "banner1_headerContainer",
    parent: "banner1_logoImage",
    attributes: { style: { value: {} }, href: { value: "http://example.com" } },
  }),
  el("banner1_logoImage", {
    blockId: "banner1_headerContainer",
    attributes: { style: { value: {} }, src: { value: "logo.png" } },
  }),
  el("banner1_title", {
    wrapperId: "banner1_background",
    classes: ["editable", "text"],
    types: ["text"],
    textContent: "What's New?",
    attributes: {
      style: { value: { "font-size": { desktop: "36px", mobile: "30px" } } },
    },
  }),
];

// componentItem.html is overwritten on every switch, but arrange is always fed the
// pristine defaultHtml — this mirrors loadStylesForComponent.
const toggleBreakpoint = (to: "desktop" | "mobile") => {
  breakpoint.value = to;
  return arrangeElementsInComponentHTML(PRISTINE_HTML, JSON_DATA, true);
};

describe("breakpoint switching with real style application", () => {
  it("keeps the logo link wrapping the image through desktop -> mobile -> desktop", () => {
    toggleBreakpoint("desktop");
    toggleBreakpoint("mobile");
    const $ = cheerio.load(toggleBreakpoint("desktop"));

    expect($("#banner1_logoWrapper")).toHaveLength(1);
    expect($("#banner1_logoImageLink").children("img").attr("id")).toBe(
      "banner1_logoImage"
    );
    expect($("#banner1_headerContainer").children().toArray()).toHaveLength(1);
  });

  it("still applies per-breakpoint styles to json elements", () => {
    expect(
      cheerio.load(toggleBreakpoint("mobile"))("#banner1_title").attr("style")
    ).toContain("font-size: 30px");
    expect(
      cheerio.load(toggleBreakpoint("desktop"))("#banner1_title").attr("style")
    ).toContain("font-size: 36px");
  });

  it("produces identical html for the same breakpoint every time", () => {
    const first = toggleBreakpoint("mobile");
    toggleBreakpoint("desktop");
    expect(toggleBreakpoint("mobile")).toBe(first);
  });
});

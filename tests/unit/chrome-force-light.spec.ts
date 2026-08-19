// wrapInChrome wraps emitted table HTML in the email Chrome and applies the force-light
// head signals (ADR-0006). updateComponentItemDom pulls in the vuex store via update_dom,
// so stub that module out — wrapInChrome only uses the cheerio-based updateBody/updateHead.
jest.mock("@/composables/canvas/update_dom", () => ({
  updateDom: () => ({ updateComponentItemDom: (c: any) => c }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { projectHtml } = require("@/composables/project/html");
const { wrapInChrome } = projectHtml();

const STYLE = {
  layout: "collapsed",
  backgroundColor: "#F0F0F0",
  fontFamily: "'DM Sans', sans-serif",
  buttonColor: "",
  backgroundImage: "",
  previewText: "Hello",
};

const BODY = `<table id="root"><tbody><tr><td>hi</td></tr></tbody></table>`;

describe("wrapInChrome force light (ADR-0006)", () => {
  it("declares light-only via color-scheme metas and :root", () => {
    const html = wrapInChrome(BODY, STYLE);
    expect(html).toContain('name="color-scheme" content="light"');
    expect(html).toContain('name="supported-color-schemes" content="light"');
    expect(html).toContain("color-scheme: light");
  });

  it("emits no prefers-color-scheme: dark rule", () => {
    expect(wrapInChrome(BODY, STYLE)).not.toContain("prefers-color-scheme");
  });

  it("injects the Outlook [data-ogsc]/[data-ogsb] reassertions when provided", () => {
    const overrides =
      "#title[data-ogsc] { color: #fffffe !important; }\n" +
      "#root[data-ogsb] { background-color: #010101 !important; }";
    const html = wrapInChrome(BODY, STYLE, overrides);
    expect(html).toContain("#title[data-ogsc]");
    expect(html).toContain("#root[data-ogsb]");
    expect(html).toContain("background-color: #010101 !important;");
  });

  it("omits the overrides style block when there are no colours to reassert", () => {
    const html = wrapInChrome(BODY, STYLE);
    expect(html).not.toContain("data-ogsc");
    expect(html).not.toContain("data-ogsb");
  });
});

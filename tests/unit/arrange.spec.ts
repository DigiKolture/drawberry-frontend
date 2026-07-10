import * as cheerio from "cheerio";

// updateElementDom pulls in the vuex store and vue's reactivity; arrange's structural
// behaviour is what is under test here, so stub it out and pass updateStyle = false.
jest.mock("@/composables/canvas/update_dom", () => ({
  updateDom: () => ({ updateElementDom: (html: string) => html }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { arrange } = require("@/composables/canvas/elements/arrange");
const { arrangeElementsInComponentHTML } = arrange();

// Trimmed from src/data/banners.html, keeping the structure that matters:
// headerContainer > logoWrapper (non-editable) > logoImageLink > logoImage
const BANNER1 = `
<div component="Banner 1" id="banner1">
  <div id="banner1_background" class="editable" style="display:flex;">
    <div block id="banner1_headerContainer" class="editable" style="display:flex;">
      <div id="banner1_logoWrapper" style="flex:0 0 auto;" data-mobile-style="width: 100%;">
        <a id="banner1_logoImageLink" parent="banner1_logoImage" class="editable" href="http://example.com">
          <img id="banner1_logoImage" class="editable" src="logo.png" alt="">
        </a>
      </div>
      <div id="banner1_headerLinks" class="editable" style="display:flex;">
        <a block id="banner1_headerLink1" class="editable text" href="http://example.com">Menu</a>
        <a block id="banner1_headerLink2" class="editable text" href="http://example.com">Template</a>
        <a block id="banner1_headerLink3" class="editable text" href="http://example.com">Category</a>
      </div>
    </div>
    <div id="banner1_subtitle" block class="editable text">Weekly Digest</div>
    <div id="banner1_title" block class="editable text">What's New?</div>
  </div>
</div>`;

// Mirrors what the backend's destructureHTML emits: wrapperId is set only on block
// elements, blockId only on non-block ones. Note logoImage.blockId points at
// headerContainer, not at its real parent logoImageLink — arrange must not trust it.
const BANNER1_JSON = [
  { id: "banner1_background", wrapperId: null, blockId: null, parent: null },
  {
    id: "banner1_headerContainer",
    wrapperId: "banner1_background",
    blockId: null,
    parent: null,
  },
  {
    id: "banner1_logoImageLink",
    wrapperId: null,
    blockId: "banner1_headerContainer",
    parent: "banner1_logoImage",
  },
  {
    id: "banner1_logoImage",
    wrapperId: null,
    blockId: "banner1_headerContainer",
    parent: null,
  },
  {
    id: "banner1_headerLinks",
    wrapperId: null,
    blockId: "banner1_headerContainer",
    parent: null,
  },
  {
    id: "banner1_headerLink1",
    wrapperId: "banner1_headerLinks",
    blockId: null,
    parent: null,
  },
  {
    id: "banner1_headerLink2",
    wrapperId: "banner1_headerLinks",
    blockId: null,
    parent: null,
  },
  {
    id: "banner1_headerLink3",
    wrapperId: "banner1_headerLinks",
    blockId: null,
    parent: null,
  },
  {
    id: "banner1_subtitle",
    wrapperId: "banner1_background",
    blockId: null,
    parent: null,
  },
  {
    id: "banner1_title",
    wrapperId: "banner1_background",
    blockId: null,
    parent: null,
  },
];

const run = (html: string, json: any[]) =>
  arrangeElementsInComponentHTML(html, json, false);

const childIds = (html: string, selector: string) =>
  cheerio
    .load(html)(selector)
    .children()
    .toArray()
    .map((el: any) => el.attribs?.id);

describe("arrangeElementsInComponentHTML", () => {
  describe("structure preservation", () => {
    it("keeps the non-editable logoWrapper, which is absent from the json", () => {
      const $ = cheerio.load(run(BANNER1, BANNER1_JSON));
      expect($("#banner1_logoWrapper")).toHaveLength(1);
      expect($("#banner1_logoWrapper").attr("data-mobile-style")).toBe(
        "width: 100%;"
      );
    });

    it("keeps the logo link wrapped around the logo image", () => {
      const $ = cheerio.load(run(BANNER1, BANNER1_JSON));
      const img = $("#banner1_logoImageLink").children("img");
      expect(img).toHaveLength(1);
      expect(img.attr("id")).toBe("banner1_logoImage");
    });

    it("does not flatten the logo pair onto the block named by blockId", () => {
      expect(
        childIds(run(BANNER1, BANNER1_JSON), "#banner1_headerContainer")
      ).toEqual(["banner1_logoWrapper", "banner1_headerLinks"]);
    });

    it("is idempotent across repeated breakpoint switches", () => {
      const first = run(BANNER1, BANNER1_JSON);
      let latest = first;
      for (let i = 0; i < 5; i++) latest = run(BANNER1, BANNER1_JSON);
      expect(latest).toBe(first);
    });
  });

  describe("reordering", () => {
    it("sorts siblings into json order", () => {
      const reordered = BANNER1_JSON.filter(
        (el) => el.id !== "banner1_headerLink1"
      );
      reordered.push(
        BANNER1_JSON.find((el) => el.id === "banner1_headerLink1") as any
      );

      expect(childIds(run(BANNER1, reordered), "#banner1_headerLinks")).toEqual(
        ["banner1_headerLink2", "banner1_headerLink3", "banner1_headerLink1"]
      );
    });

    it("leaves non-editable siblings in their slot when reordering around them", () => {
      const html = `
        <div component="X" id="x">
          <div id="x_background" class="editable">
            <div block id="x_e1" class="editable">1</div>
            <div id="x_wrapper" style="flex:0 0 auto;"></div>
            <div block id="x_e2" class="editable">2</div>
          </div>
        </div>`;

      const json = [{ id: "x_background" }, { id: "x_e2" }, { id: "x_e1" }];

      // A naive append-in-json-order would emit [x_wrapper, x_e2, x_e1].
      expect(childIds(run(html, json), "#x_background")).toEqual([
        "x_e2",
        "x_wrapper",
        "x_e1",
      ]);
    });
  });

  describe("duplicates", () => {
    // duplicate.ts only ever mutates the json; arrange has to materialise the DOM.
    // It splices the copies in directly after the source subtree, which is what puts
    // the duplicate next to its source rather than at the end of the background.
    const sourceSubtreeEnd =
      BANNER1_JSON.findIndex((el) => el.id === "banner1_headerLink3") + 1;

    const withDuplicatedHeader = [
      ...BANNER1_JSON.slice(0, sourceSubtreeEnd),
      { id: "banner1_headerContainer_dup_ab12" },
      {
        id: "banner1_logoImageLink_dup_ab12",
        parent: "banner1_logoImage_dup_ab12",
      },
      { id: "banner1_logoImage_dup_ab12" },
      { id: "banner1_headerLinks_dup_ab12" },
      { id: "banner1_headerLink1_dup_ab12" },
      { id: "banner1_headerLink2_dup_ab12" },
      { id: "banner1_headerLink3_dup_ab12" },
      ...BANNER1_JSON.slice(sourceSubtreeEnd),
    ];

    it("materialises a duplicated block that exists only in the json", () => {
      const $ = cheerio.load(run(BANNER1, withDuplicatedHeader));
      expect($("#banner1_headerContainer_dup_ab12")).toHaveLength(1);
      expect($("#banner1_headerLink3_dup_ab12")).toHaveLength(1);
    });

    it("carries the non-editable wrapper into the duplicated subtree", () => {
      const $ = cheerio.load(run(BANNER1, withDuplicatedHeader));
      const img = $("#banner1_logoImageLink_dup_ab12").children("img");
      expect($("#banner1_logoWrapper_dup_ab12")).toHaveLength(1);
      expect(img.attr("id")).toBe("banner1_logoImage_dup_ab12");
    });

    it("rewrites the parent attribute on the duplicated link", () => {
      const $ = cheerio.load(run(BANNER1, withDuplicatedHeader));
      expect($("#banner1_logoImageLink_dup_ab12").attr("parent")).toBe(
        "banner1_logoImage_dup_ab12"
      );
    });

    it("places the duplicate next to its source", () => {
      expect(
        childIds(run(BANNER1, withDuplicatedHeader), "#banner1_background")
      ).toEqual([
        "banner1_headerContainer",
        "banner1_headerContainer_dup_ab12",
        "banner1_subtitle",
        "banner1_title",
      ]);
    });

    it("does not resurrect a duplicate that undo removed from the json", () => {
      const arranged = run(BANNER1, withDuplicatedHeader);
      const $ = cheerio.load(run(arranged, BANNER1_JSON));
      expect($("#banner1_headerContainer_dup_ab12")).toHaveLength(0);
      expect($("#banner1_logoWrapper")).toHaveLength(1);
    });
  });

  describe("pruning", () => {
    it("removes editable elements the json dropped but keeps non-editable ones", () => {
      const withoutSubtitle = BANNER1_JSON.filter(
        (el) => el.id !== "banner1_subtitle"
      );
      const $ = cheerio.load(run(BANNER1, withoutSubtitle));
      expect($("#banner1_subtitle")).toHaveLength(0);
      expect($("#banner1_logoWrapper")).toHaveLength(1);
    });
  });
});

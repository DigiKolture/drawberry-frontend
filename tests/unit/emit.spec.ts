import * as cheerio from "cheerio";
import { emit } from "@/composables/canvas/compile/emit";
import {
  MeasuredNode,
  MeasuredRole,
  MeasuredTree,
} from "@/composables/canvas/compile/measured-tree";

// Synthetic MeasuredTree fixtures — no browser needed. The emitter is a pure function of
// measured geometry, so we hand it the numbers a real measurement pass would produce and
// assert the emitted tables reproduce them (widths, alignment, gaps). This is Seam 1.

let autoId = 0;
const node = (
  role: MeasuredRole,
  rect: [number, number, number, number],
  extra: Partial<MeasuredNode> = {}
): MeasuredNode => ({
  id: extra.id ?? `n${autoId++}`,
  role,
  rect: { x: rect[0], y: rect[1], width: rect[2], height: rect[3] },
  styles: extra.styles ?? {},
  children: extra.children ?? [],
  ...extra,
});

const tree = (contentWidth: number, root: MeasuredNode): MeasuredTree => ({
  contentWidth,
  root,
});

// The emitter returns body content (nested tables), not a full document — chrome wraps it
// separately. cheerio parses the fragment fine.
const load = (html: string) => cheerio.load(html);

describe("emit(MeasuredTree)", () => {
  describe("single-column stack", () => {
    // Two text blocks stacked vertically inside a 600px root.
    const t = tree(
      600,
      node("root", [0, 0, 600, 200], {
        id: "root",
        children: [
          node("text", [0, 0, 600, 40], {
            id: "title",
            text: "What's New?",
            styles: { fontSize: "32px", color: "rgb(17, 17, 17)" },
          }),
          node("text", [0, 60, 600, 24], {
            id: "subtitle",
            text: "Weekly Digest",
            styles: { fontSize: "16px" },
          }),
        ],
      })
    );

    it("emits both text blocks as rows in document order", () => {
      const $ = load(emit(t));
      expect($("#title").length).toBe(1);
      expect($("#subtitle").length).toBe(1);
      expect($("#title").text()).toContain("What's New?");
      expect($("#subtitle").text()).toContain("Weekly Digest");
    });

    it("bakes the measured content width onto the outer table", () => {
      const $ = load(emit(t));
      expect($("table").first().attr("width")).toBe("600");
    });

    it("emits a vertical gap spacer between stacked rows", () => {
      const $ = load(emit(t));
      // 60px top of subtitle - 40px bottom of title = 20px gap
      const spacerHeights = $("td[height]")
        .toArray()
        .map((el) => $(el).attr("height"));
      expect(spacerHeights).toContain("20");
    });

    it("lets text cells auto-height (no baked height on the text cell)", () => {
      const $ = load(emit(t));
      const style = $("#title").attr("style") || "";
      expect(style).not.toMatch(/height\s*:/);
    });
  });

  describe("multi-column row", () => {
    // Two 290px columns side-by-side with a 20px gap inside a 600px root.
    const t = tree(
      600,
      node("root", [0, 0, 600, 120], {
        id: "root",
        children: [
          node("container", [0, 0, 290, 120], {
            id: "colA",
            children: [node("text", [0, 0, 290, 40], { id: "a", text: "A" })],
          }),
          node("container", [310, 0, 290, 120], {
            id: "colB",
            children: [node("text", [310, 0, 290, 40], { id: "b", text: "B" })],
          }),
        ],
      })
    );

    it("places the two columns in a single row (side by side, not stacked)", () => {
      const $ = load(emit(t));
      const row = $("tr").filter((_, el) => $(el).find("#colA").length > 0);
      expect(row.find("#colB").length).toBe(1);
    });

    it("bakes each column's measured width", () => {
      const $ = load(emit(t));
      expect($("#colA").closest("td").attr("width")).toBe("290");
      expect($("#colB").closest("td").attr("width")).toBe("290");
    });

    it("emits a horizontal gap spacer between the columns", () => {
      const $ = load(emit(t));
      const widths = $("td[width]")
        .toArray()
        .map((el) => $(el).attr("width"));
      expect(widths).toContain("20");
    });
  });

  describe("alignment from measured x-offset", () => {
    // A 200px button centered inside a 600px root: left gap 200 == right gap 200.
    const centered = tree(
      600,
      node("root", [0, 0, 600, 60], {
        id: "root",
        children: [
          node("button", [200, 0, 200, 44], {
            id: "cta",
            text: "Shop now",
            href: "https://example.com",
            styles: {
              backgroundColor: "rgb(0, 122, 255)",
              borderRadius: "6px",
            },
          }),
        ],
      })
    );

    it("centers a button whose measured x-offset is centered", () => {
      const $ = load(emit(centered));
      const cell = $("#cta").closest("td");
      expect(cell.attr("align")).toBe("center");
    });

    it("left-aligns a button pinned to the left edge", () => {
      const left = tree(
        600,
        node("root", [0, 0, 600, 60], {
          id: "root",
          children: [
            node("button", [0, 0, 200, 44], {
              id: "cta",
              text: "Shop now",
              href: "https://example.com",
            }),
          ],
        })
      );
      const $ = load(emit(left));
      expect($("#cta").closest("td").attr("align")).toBe("left");
    });

    it("right-aligns a button pushed to the right edge", () => {
      const right = tree(
        600,
        node("root", [0, 0, 600, 60], {
          id: "root",
          children: [
            node("button", [400, 0, 200, 44], {
              id: "cta",
              text: "Shop now",
              href: "https://example.com",
            }),
          ],
        })
      );
      const $ = load(emit(right));
      expect($("#cta").closest("td").attr("align")).toBe("right");
    });
  });

  describe("leaves", () => {
    it("emits an image with its measured width, height and src", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 100], {
          id: "root",
          children: [
            node("image", [0, 0, 120, 80], {
              id: "logo",
              src: "https://example.com/logo.png",
              alt: "Logo",
            }),
          ],
        })
      );
      const $ = load(emit(t));
      const img = $("img#logo");
      expect(img.attr("src")).toBe("https://example.com/logo.png");
      expect(img.attr("width")).toBe("120");
      expect(img.attr("height")).toBe("80");
      expect(img.attr("alt")).toBe("Logo");
    });

    it("emits a button as an anchor carrying its href and measured colours", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 60], {
          id: "root",
          children: [
            node("button", [200, 0, 200, 44], {
              id: "cta",
              text: "Shop now",
              href: "https://example.com",
              styles: {
                backgroundColor: "rgb(0, 122, 255)",
                color: "rgb(255, 255, 255)",
                borderRadius: "6px",
              },
            }),
          ],
        })
      );
      const $ = load(emit(t));
      const a = $("a#cta");
      expect(a.attr("href")).toBe("https://example.com");
      expect(a.text()).toContain("Shop now");
      const style = a.attr("style") || "";
      expect(style).toContain("background-color: rgb(0, 122, 255)");
      expect(style).toContain("border-radius: 6px");
    });

    it("bakes font styles onto a text leaf", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 40], {
          id: "root",
          children: [
            node("text", [0, 0, 600, 40], {
              id: "title",
              text: "Hello",
              styles: {
                fontSize: "32px",
                fontWeight: "700",
                color: "rgb(17, 17, 17)",
                fontFamily: "DM Sans, sans-serif",
              },
            }),
          ],
        })
      );
      const style = load(emit(t))("#title").attr("style") || "";
      expect(style).toContain("font-size: 32px");
      expect(style).toContain("font-weight: 700");
      expect(style).toContain("color: rgb(17, 17, 17)");
    });
  });

  describe("snapshot", () => {
    it("is stable for a representative two-block layout", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 180], {
          id: "root",
          children: [
            node("text", [0, 0, 600, 40], {
              id: "title",
              text: "What's New?",
              styles: { fontSize: "32px", color: "rgb(17, 17, 17)" },
            }),
            node("button", [200, 80, 200, 44], {
              id: "cta",
              text: "Read more",
              href: "https://example.com",
              styles: {
                backgroundColor: "rgb(0, 122, 255)",
                color: "rgb(255, 255, 255)",
                borderRadius: "6px",
              },
            }),
          ],
        })
      );
      expect(emit(t)).toMatchSnapshot();
    });
  });
});

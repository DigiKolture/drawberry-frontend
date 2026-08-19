import * as cheerio from "cheerio";
import {
  emit,
  collectColorOverrides,
  collectMediaQuery,
} from "@/composables/canvas/compile/emit";
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

    it("caps the outer table at the measured content width but stays fluid", () => {
      const $ = load(emit(t));
      const table = $("table").first();
      // width:100% + max-width:{measured} — holds the desktop width, shrinks on narrow.
      expect(table.attr("width")).toBe("100%");
      expect(table.attr("style") || "").toContain("max-width: 600px");
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

    it("emits a bare visual box with its measured height and background", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 40], {
          id: "root",
          children: [
            node("box", [0, 0, 600, 12], {
              id: "divider",
              styles: { backgroundColor: "rgb(230, 230, 230)" },
            }),
          ],
        })
      );
      const style = load(emit(t))("#divider").attr("style") || "";
      expect(style).toContain("height: 12px");
      expect(style).toContain("background-color: rgb(230, 230, 230)");
    });

    it("keeps a bare link leaf as an anchor with its href", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 20], {
          id: "root",
          children: [
            node("text", [0, 0, 600, 20], {
              id: "unsub",
              text: "Unsubscribe",
              href: "https://example.com/unsub",
              styles: { fontSize: "12px" },
            }),
          ],
        })
      );
      const $ = load(emit(t));
      expect($("a#unsub").attr("href")).toBe("https://example.com/unsub");
      expect($("div#unsub").length).toBe(0);
    });
  });

  describe("bulletproof VML buttons", () => {
    const btn = tree(
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
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "700",
            },
          }),
        ],
      })
    );

    it("emits an Outlook VML rounded-rect from the measured dimensions", () => {
      const html = emit(btn);
      expect(html).toContain("<!--[if mso]>");
      expect(html).toContain("v:roundrect");
      expect(html).toContain("<w:anchorlock/>");
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain("width:200px");
      expect(html).toContain("height:44px");
      // radius 8 / height 44 ≈ 18%
      expect(html).toContain('arcsize="18%"');
      // VML needs hex (rgb() falls back to black in Outlook): rgb(0,122,255) → #007aff.
      expect(html).toContain('fillcolor="#007aff"');
      expect(html).not.toContain('fillcolor="rgb');
    });

    it("emits a non-Outlook <a> fallback carrying the same href and colours", () => {
      const $ = load(emit(btn));
      const a = $("a#cta");
      expect(a.attr("href")).toBe("https://example.com");
      expect(a.text()).toContain("Shop now");
      const style = a.attr("style") || "";
      expect(style).toContain("background-color: rgb(0, 122, 255)");
      expect(style).toContain("border-radius: 8px");
    });
  });

  describe("force light (ADR-0006)", () => {
    const whiteOnBlack = tree(
      600,
      node("root", [0, 0, 600, 100], {
        id: "root",
        styles: { backgroundColor: "#000000" },
        children: [
          node("text", [0, 0, 600, 40], {
            id: "title",
            text: "Hi",
            styles: { color: "#FFFFFF" },
          }),
          node("button", [0, 50, 200, 44], {
            id: "cta",
            text: "Go",
            href: "https://example.com",
            styles: { backgroundColor: "#000000", color: "#FFFFFF" },
          }),
        ],
      })
    );

    it("bakes off-white / off-black instead of pure #FFFFFF / #000000", () => {
      const html = emit(whiteOnBlack);
      expect(html).toContain("#fffffe");
      expect(html).toContain("#010101");
      expect(html).not.toMatch(/#ffffff/i);
      expect(html).not.toMatch(/#000000/i);
    });

    it("never emits a prefers-color-scheme: dark rule", () => {
      expect(emit(whiteOnBlack)).not.toContain("prefers-color-scheme");
    });

    it("collects Outlook [data-ogsc]/[data-ogsb] reassertions for placed colours", () => {
      const css = collectColorOverrides(whiteOnBlack);
      expect(css).toContain("#title[data-ogsc] { color: #fffffe !important; }");
      expect(css).toContain(
        "#root[data-ogsb] { background-color: #010101 !important; }"
      );
    });

    it("emits no overrides for a design that places no colours", () => {
      const plain = tree(
        600,
        node("root", [0, 0, 600, 40], {
          id: "root",
          children: [node("text", [0, 0, 600, 40], { id: "t", text: "x" })],
        })
      );
      expect(collectColorOverrides(plain)).toBe("");
    });
  });

  describe("responsive: hybrid/spongy stacking from the mobile measurement", () => {
    // Two 290px columns side by side on desktop (shared y); on mobile they stack (distinct
    // y). The emitter must OBSERVE the stacking from the mobile tree, not infer it.
    const desktop = tree(
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
    const mobileStacked = tree(
      375,
      node("root", [0, 0, 375, 240], {
        id: "root",
        children: [
          node("container", [0, 0, 375, 120], { id: "colA", children: [] }),
          node("container", [0, 120, 375, 120], { id: "colB", children: [] }),
        ],
      })
    );
    const mobileSideBySide = tree(
      375,
      node("root", [0, 0, 375, 120], {
        id: "root",
        children: [
          node("container", [0, 0, 185, 120], { id: "colA", children: [] }),
          node("container", [190, 0, 185, 120], { id: "colB", children: [] }),
        ],
      })
    );

    it("emits fluid-hybrid columns for a row that stacks on mobile", () => {
      const html = emit(desktop, mobileStacked);
      const $ = load(html);
      // Two fluid columns carrying the measured desktop max-width, wrapped for stacking.
      expect($("div.pc-col").length).toBe(2);
      const colAStyle = $("#colA").closest("div.pc-col").attr("style") || "";
      expect(colAStyle).toContain("max-width: 290px");
      expect(colAStyle).toContain("display: inline-block");
    });

    it("wraps the hybrid columns in MSO ghost tables so Outlook keeps fixed widths", () => {
      const html = emit(desktop, mobileStacked);
      expect(html).toContain("<!--[if mso]>");
      expect(html).toContain('<td width="290"');
    });

    it("leaves a row that stays side-by-side on mobile as plain fixed cells", () => {
      const html = emit(desktop, mobileSideBySide);
      expect(html).not.toContain("pc-col");
      // still baked at the measured width via a normal cell
      expect(load(html)("#colA").closest("td").attr("width")).toBe("290");
    });

    it("with no mobile tree, output is unchanged desktop (backward compatible)", () => {
      expect(emit(desktop)).toBe(emit(desktop, undefined));
      expect(emit(desktop)).not.toContain("pc-col");
    });

    it("generates a measured @media block that owns the stacking", () => {
      const css = collectMediaQuery(desktop, mobileStacked);
      // Breakpoint sits just below the 600px content width so desktop stays desktop.
      expect(css).toMatch(/@media[^{]*max-width:\s*599px/);
      expect(css).toContain(".pc-col");
      expect(css).toContain("100% !important");
      expect(css).toContain(".pc-gap");
    });

    it("emits no @media when nothing stacks on mobile", () => {
      expect(collectMediaQuery(desktop, mobileSideBySide)).toBe("");
      expect(collectMediaQuery(desktop, undefined)).toBe("");
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

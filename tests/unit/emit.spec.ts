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

  describe("position from measured x-offset (lone narrow child)", () => {
    // A lone child narrower than its parent is placed by spacer cells that reproduce its
    // measured x, and its measured width is pinned on its cell — so it lands where the
    // Canvas put it, and a block text leaf wraps where the Canvas wrapped it instead of
    // spreading to the container's full width.
    const cellsOf = ($: ReturnType<typeof load>, id: string) =>
      $(`#${id}`)
        .closest("tr")
        .children("td")
        .toArray()
        .map((el) => ({
          width: $(el).attr("width"),
          holds: $(el).find(`#${id}`).length > 0,
        }));

    // A 200px button inside a 600px root, at a given measured x.
    const button = (x: number) =>
      tree(
        600,
        node("root", [0, 0, 600, 60], {
          id: "root",
          children: [
            node("button", [x, 0, 200, 44], {
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

    it("centers a button whose measured x-offset is centered (200 | 200 | 200)", () => {
      const cells = cellsOf(load(emit(button(200))), "cta");
      expect(cells.map((c) => c.width)).toEqual(["200", "200", "200"]);
      expect(cells[1].holds).toBe(true);
    });

    it("left-aligns a button pinned to the left edge (no leading spacer)", () => {
      const cells = cellsOf(load(emit(button(0))), "cta");
      expect(cells.map((c) => c.width)).toEqual(["200", "400"]);
      expect(cells[0].holds).toBe(true);
    });

    it("right-aligns a button pushed to the right edge (no trailing spacer)", () => {
      const cells = cellsOf(load(emit(button(400))), "cta");
      expect(cells.map((c) => c.width)).toEqual(["400", "200"]);
      expect(cells[1].holds).toBe(true);
    });

    it("pins an inset paragraph to its measured width so it wraps like the Canvas", () => {
      // The reported defect: a centered description narrower than its card (x 60, w 480
      // in a 600 root) was emitted alignment-only, so the block text filled all 600px and
      // wrapped later than the Canvas did.
      const t = tree(
        600,
        node("root", [0, 0, 600, 80], {
          id: "root",
          children: [
            node("text", [60, 0, 480, 48], {
              id: "desc",
              text: "Listen to the soundtrack",
              styles: { textAlign: "center" },
            }),
          ],
        })
      );
      const cells = cellsOf(load(emit(t)), "desc");
      expect(cells.map((c) => c.width)).toEqual(["60", "480", "60"]);
      expect(cells[1].holds).toBe(true);
    });

    it("leaves a full-width child unpinned so it fills its cell", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 40], {
          id: "root",
          children: [node("text", [0, 0, 600, 40], { id: "p", text: "Full" })],
        })
      );
      const cells = cellsOf(load(emit(t)), "p");
      expect(cells.map((c) => c.width)).toEqual([undefined]);
    });

    it("emits a text element's own measured padding inside its pinned cell", () => {
      // The rect is border-box, so padding emitted inside the pinned cell keeps the text
      // content wrapping at exactly the Canvas width.
      const t = tree(
        600,
        node("root", [0, 0, 600, 80], {
          id: "root",
          children: [
            node("text", [60, 0, 480, 48], {
              id: "desc",
              text: "Hi",
              styles: { paddingLeft: "16px", paddingRight: "16px" },
            }),
          ],
        })
      );
      const style = load(emit(t))("#desc").attr("style") || "";
      expect(style).toContain("padding-left: 16px");
      expect(style).toContain("padding-right: 16px");
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

    it("keeps a quoted font-family from breaking the style attribute", () => {
      const t = tree(
        600,
        node("root", [0, 0, 600, 40], {
          id: "root",
          children: [
            node("text", [0, 0, 600, 40], {
              id: "title",
              text: "Hi",
              // getComputedStyle returns font-family with double quotes.
              styles: { fontFamily: '"DM Sans", Helvetica, Arial, sans-serif' },
            }),
          ],
        })
      );
      const html = emit(t);
      // The raw output must not carry a double quote that would terminate style="...".
      expect(html).not.toContain('"DM Sans"');
      // cheerio parses the attribute intact, and it still names the font.
      const style = load(html)("#title").attr("style") || "";
      expect(style).toContain("font-family: 'DM Sans', Helvetica");
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
      // Links underline by default; with no measured decoration we reassert "none".
      expect($("a#unsub").attr("style")).toContain("text-decoration: none");
    });

    it("reproduces a link's measured text-decoration (no unwanted underline)", () => {
      const noUnderline = tree(
        600,
        node("root", [0, 0, 600, 20], {
          id: "root",
          children: [
            node("text", [0, 0, 600, 20], {
              id: "link",
              text: "Read",
              href: "https://example.com",
              styles: { textDecoration: "none" },
            }),
          ],
        })
      );
      expect(load(emit(noUnderline))("#link").attr("style")).toContain(
        "text-decoration: none"
      );

      const underlined = tree(
        600,
        node("root", [0, 0, 600, 20], {
          id: "root",
          children: [
            node("text", [0, 0, 600, 20], {
              id: "link",
              text: "Read",
              href: "https://example.com",
              styles: { textDecoration: "underline" },
            }),
          ],
        })
      );
      // A design that intentionally underlines is preserved.
      expect(load(emit(underlined))("#link").attr("style")).toContain(
        "text-decoration: underline"
      );
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

  describe("responsive: two-layout from the mobile measurement", () => {
    // A section ("hdr") with two 290px columns side by side on desktop. Given a mobile tree,
    // EVERY top-level section is emitted as both layouts — its mobile copy transcribed from
    // the mobile measurement, whether the columns stack there (mobileStacked) or stay side by
    // side at new widths (mobileSideBySide) — never inferred or approximated from desktop.
    const desktop = tree(
      600,
      node("root", [0, 0, 600, 120], {
        id: "root",
        children: [
          node("container", [0, 0, 600, 120], {
            id: "hdr",
            children: [
              node("container", [0, 0, 290, 120], {
                id: "colA",
                children: [
                  node("text", [0, 0, 290, 40], { id: "a", text: "A" }),
                ],
              }),
              node("container", [310, 0, 290, 120], {
                id: "colB",
                children: [
                  node("text", [310, 0, 290, 40], { id: "b", text: "B" }),
                ],
              }),
            ],
          }),
        ],
      })
    );
    const mobileStacked = tree(
      375,
      node("root", [0, 0, 375, 240], {
        id: "root",
        children: [
          node("container", [0, 0, 375, 240], {
            id: "hdr",
            children: [
              node("container", [0, 0, 375, 120], { id: "colA", children: [] }),
              node("container", [0, 120, 375, 120], {
                id: "colB",
                children: [],
              }),
            ],
          }),
        ],
      })
    );
    const mobileSideBySide = tree(
      375,
      node("root", [0, 0, 375, 120], {
        id: "root",
        children: [
          node("container", [0, 0, 375, 120], {
            id: "hdr",
            children: [
              node("container", [0, 0, 185, 120], { id: "colA", children: [] }),
              node("container", [190, 0, 185, 120], {
                id: "colB",
                children: [],
              }),
            ],
          }),
        ],
      })
    );

    it("emits both a desktop copy and a mobile copy for a section that reflows", () => {
      const $ = load(emit(desktop, mobileStacked));
      expect($("div.pc-d").length).toBe(1);
      expect($("div.pc-m").length).toBe(1);
      // The mobile copy is hidden by default and from Outlook.
      const mStyle = $("div.pc-m").attr("style") || "";
      expect(mStyle).toContain("display: none");
      expect(mStyle).toContain("mso-hide: all");
    });

    it("the desktop copy keeps the columns side by side at their measured widths", () => {
      const $ = load(emit(desktop, mobileStacked));
      const desktopColA = $("div.pc-d #colA");
      expect(desktopColA.length).toBe(1);
      expect(desktopColA.closest("td").attr("width")).toBe("290");
    });

    it("the mobile copy is the measured mobile layout (stacked, full width)", () => {
      const $ = load(emit(desktop, mobileStacked));
      const mobileColA = $("div.pc-m #colA");
      const mobileColB = $("div.pc-m #colB");
      expect(mobileColA.length).toBe(1);
      expect(mobileColB.length).toBe(1);
      // Full-width mobile columns → no fixed 290 width column baked here.
      expect(mobileColA.closest("td").attr("width")).toBeUndefined();
    });

    it("a section that stays side-by-side on mobile still gets its own measured mobile copy", () => {
      // The mobile Canvas differs even without restacking (here: 185px columns instead of
      // 290px — in real components also font sizes, paddings, image sizes). A fluid-shrunk
      // desktop copy would only scale the 290s; the mobile copy transcribes the measurement.
      const $ = load(emit(desktop, mobileSideBySide));
      expect($("div.pc-d #colA").closest("td").attr("width")).toBe("290");
      expect($("div.pc-m #colA").closest("td").attr("width")).toBe("185");
      expect($("div.pc-m #colB").closest("td").attr("width")).toBe("185");
    });

    it("with no mobile tree, output is the plain desktop layout (backward compatible)", () => {
      expect(emit(desktop)).toBe(emit(desktop, undefined));
      expect(emit(desktop)).not.toContain("pc-d");
    });

    it("generates the measured @media toggle whenever there is a mobile render", () => {
      for (const mobile of [mobileStacked, mobileSideBySide]) {
        const css = collectMediaQuery(desktop, mobile);
        // Breakpoint sits just below the 600px content width so desktop stays desktop.
        expect(css).toMatch(/@media[^{]*max-width:\s*599px/);
        expect(css).toContain(".pc-d { display: none !important; }");
        expect(css).toContain(".pc-m { display: block !important; }");
      }
    });

    it("emits no @media without a mobile render (there is no mobile copy to toggle to)", () => {
      expect(collectMediaQuery(desktop, undefined)).toBe("");
      const empty = tree(375, node("root", [0, 0, 375, 0], { id: "root" }));
      expect(collectMediaQuery(desktop, empty)).toBe("");
    });
  });

  describe("squeeze resilience (a phone narrower than the mobile measurement)", () => {
    // Email-chrome gutters and narrower phones give the mobile copy less width than it was
    // measured at, and a squeezed row shrinks every cell a few percent. Content that was ONE
    // line on the Canvas must not wrap for that: nowrap holds its min-content width so the
    // spacer cells absorb the squeeze. Multi-line paragraphs keep wrapping naturally.
    const textLeaf = (rect: [number, number, number, number]) =>
      emit(
        tree(
          600,
          node("root", [0, 0, 600, 200], {
            id: "root",
            children: [
              node("text", rect, {
                id: "t",
                text: "Top Tips",
                styles: { lineHeight: "20px" },
              }),
            ],
          })
        )
      );

    it("keeps a single-line text leaf on one line (white-space: nowrap)", () => {
      // 54px wide, 20px tall at a 20px line-height: one line on the Canvas.
      const style = load(textLeaf([273, 0, 54, 20]))("#t").attr("style") || "";
      expect(style).toContain("white-space: nowrap");
    });

    it("lets a multi-line paragraph keep wrapping (no nowrap)", () => {
      // 56px tall at a 20px line-height: it already wrapped on the Canvas.
      const style = load(textLeaf([40, 0, 520, 56]))("#t").attr("style") || "";
      expect(style).not.toContain("white-space");
    });

    it("keeps a button label on one line", () => {
      const $ = load(
        emit(
          tree(
            600,
            node("root", [0, 0, 600, 60], {
              id: "root",
              children: [
                node("button", [223, 0, 154, 50], {
                  id: "cta",
                  text: "Secure you data",
                  href: "https://example.com",
                  styles: {
                    backgroundColor: "rgb(92, 153, 25)",
                    lineHeight: "24px",
                  },
                }),
              ],
            })
          )
        )
      );
      expect($("#cta").attr("style") || "").toContain("white-space: nowrap");
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

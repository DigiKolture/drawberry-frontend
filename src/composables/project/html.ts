import cheerio from "cheerio";
import { updateDom } from "@/composables/canvas/update_dom";
import { ProjectStyle } from "@/store/modules/canvas/types";
import path from "path";
import fs from "fs";

export function projectHtml() {
  const { updateComponentItemDom } = updateDom();
  const getHTML = (project: any): string => {
    const projectComponents = project.components;

    let resultHTML = null;

    for (const projectComponent of projectComponents) {
      const { html } = updateComponentItemDom(projectComponent);

      if (resultHTML == null) {
        resultHTML = html;
      } else {
        if (project.style && project.style.layout === "cards") {
          resultHTML = addSpacing(resultHTML);
        }
        resultHTML = combineHTMLDocumentsWithCheerio(resultHTML, html);
      }
    }

    resultHTML = updateBody(project.style, resultHTML);
    resultHTML = updateHead(resultHTML);

    return resultHTML;
  };

  const addSpacing = (html: string): string => {
    const spacingHTML = `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
          <tbody>
            <tr>
              <td height="10" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
            </tr>
        </tbody>
      `;
    return combineHTMLDocumentsWithCheerio(html, spacingHTML);
  };

  const combineHTMLDocumentsWithCheerio = (
    html1: string,
    html2: string
  ): string => {
    const $doc1 = cheerio.load(html1);
    const $doc2 = cheerio.load(html2);
    const body1Content = $doc1("body").html();
    const body2Content = $doc2("body").html();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const combinedContent = body1Content + body2Content;
    const $combined = cheerio.load(`
    <html>
    <head></head>
    <body>${combinedContent}</body>

    </html>`);

    return $combined.html();
  };

  const updateBody = (style: ProjectStyle, html: string): string => {
    let $ = cheerio.load(html);
    const bodyContent = $("body").html();

    $ = cheerio.load(`
          <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head></head>
            <body>
                <!-- Preview Text -->
                <span style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${
                  style.previewText || "Preview text"
                }</span>
                <!-- Preview Text -->
                <table class="pc-email-body" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="table-layout: fixed;">
                  <tbody>
                    <tr>
                      <td class="pc-email-body-inner" align="center" valign="top">
                        <!--[if gte mso 9]>
                          <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                              <v:fill type="tile" src="" color="#E8E9E9"/>
                          </v:background>
                          <![endif]-->
                        <!--[if (gte mso 9)|(IE)]><table width="620" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation"><tr><td width="620" align="center" valign="top"><![endif]-->
                        <table class="pc-email-container" width="100%" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto; max-width: 620px;">
                          <tbody>
                            <tr>
                              <td align="left" valign="top" style="padding: 0 10px;">

                                <!-- Component Spacing -->
                                <table id="spacing" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tbody>
                                    <tr>
                                      <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                    </tr>
                                  </tbody>
                                </table>
                                <!-- Component Spacing -->

                                ${bodyContent}

                                <!-- Component Spacing -->
                                  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                    <tbody>
                                      <tr>
                                        <td height="20" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                <!-- Component Spacing -->
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
              </table>
              <!-- Fix for Gmail on iOS -->
               <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
            </body>
        </html>`);

    const styleAttr: any = {
      width: "100% !important",
      margin: 0,
      padding: 0,
      "mso-line-height-rule": "exactly",
      "-webkit-font-smoothing": "antialiased",
      "-webkit-text-size-adjust": "100%",
      "-ms-text-size-adjust": "100%",
      "background-color": style.backgroundColor,
      "background-image": `url('${style.backgroundImage}')`,
      "background-size": "cover",
    };

    const styleString = Object.keys(styleAttr)
      .map((key: string) => `${key}: ${styleAttr[key]};`)
      .join(" ");

    $("body").attr("style", styleString);

    return $.html();
  };

  const updateHead = (html: string): string => {
    const $ = cheerio.load(html);

    const metaTags = `
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="format-detection" content="telephone=no">
        <meta name="x-apple-disable-message-reformatting">
        <!-- Force light (ADR-0006): declare light-only so Apple Mail / iOS stop inverting;
             no dark-mode media query is emitted anywhere. -->
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
    rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <style>

  /* Force light (ADR-0006): honoured by Apple Mail / iOS. No dark variant is emitted. */
  :root {
    color-scheme: light;
    supported-color-schemes: light;
  }

   #outlook a {
  padding: 0;
}

.ReadMsgBody,
.ExternalClass {
  width: 100%;
}

.ExternalClass,
.ExternalClass p,
.ExternalClass td,
.ExternalClass div,
.ExternalClass span,
.ExternalClass font {
  line-height: 100%;
}

div[style*="margin: 14px 0"],
div[style*="margin: 16px 0"] {
  margin: 0 !important;
}

table,
td {
  mso-table-lspace: 0;
  mso-table-rspace: 0;
}

table,
tr,
td {
  border-collapse: collapse;
}

body,
td,
th,
p,
div,
li,
a,
span {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  mso-line-height-rule: exactly;
}

img {
  border: 0;
  outline: none;
  line-height: 100%;
  text-decoration: none;
  -ms-interpolation-mode: bicubic;
}

a[x-apple-data-detectors] {
  color: inherit !important;
  text-decoration: none !important;
}

body {
  margin: 0;
  padding: 0;
  width: 100% !important;
  -webkit-font-smoothing: antialiased;
}

.pc-gmail-fix {
  display: none;
  display: none !important;
}

@media screen and (min-width: 621px) {
  .pc-email-container {
    width: 620px !important;
  }
}


 
</style>
        <!--[if mso]>
          <style type="text/css">
              .pc-fb-font {
                  font-family: Helvetica, Arial, sans-serif !important;
              }
          </style>
          <![endif]-->
        <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
      `;
    $("head").append(metaTags);

    // const cssFilePath = path.join(__dirname, "styles.css");
    // const cssContent = fs.readFileSync(cssFilePath, "utf8");
    // const styleElement = $('<style type="text/css"></style>').text(cssContent);
    // $("head").append(styleElement);

    return $.html({ decodeEntities: false, xmlMode: true });
  };

  // Wrap already-emitted body content (the compiled nested tables from the flex→table
  // emitter) in the same email Chrome getHTML uses — the outer container tables, MSO
  // conditionals, and <head>. This is the single Chrome layer both the legacy div render
  // and the measured compiler share (ADR-0005: one producer, reusing html.ts).
  //
  // `headCss` is the emitter's compile-time CSS for the <head>: the measured mobile-stacking
  // `@media` block (ticket 03) plus the Outlook `[data-ogsc]/[data-ogsb]` force-light colour
  // reassertions (ADR-0006). Empty string when the design needs neither.
  const wrapInChrome = (
    bodyContent: string,
    style: ProjectStyle,
    headCss = ""
  ): string => {
    let html = `<html><head></head><body>${bodyContent}</body></html>`;
    html = updateBody(style, html);
    html = updateHead(html);
    if (headCss) {
      // updateHead already serialised the document; splice the style in before </head>
      // rather than re-parsing and re-serialising the whole email.
      const styleBlock = `<style type="text/css">\n${headCss}\n</style>`;
      html = html.replace("</head>", `${styleBlock}</head>`);
    }
    return html;
  };

  return {
    getHTML,
    wrapInChrome,
  };
}

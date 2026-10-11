/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
  });

  // tools/importer/parsers/hero-caption.js
  function parse(element, { document: document2 }) {
    const img = element.querySelector(":scope > img, img");
    const srcHeading = element.querySelector(".subPageTitle h1, h1, .subPageTitle h2, h2");
    const content = [];
    if (img) content.push(img);
    if (srcHeading) {
      const text = srcHeading.textContent.replace(/\s+/g, " ").trim();
      if (text) {
        const h1 = document2.createElement("h1");
        h1.textContent = text;
        content.push(h1);
      }
    } else {
      const titleWrap = element.querySelector(".subPageTitle");
      const text = titleWrap ? titleWrap.textContent.replace(/\s+/g, " ").trim() : "";
      if (text) {
        const h1 = document2.createElement("h1");
        h1.textContent = text;
        content.push(h1);
      }
    }
    if (!content.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const name = element.classList.contains("subPageImageDealer") ? "hero-caption (contained)" : "hero-caption";
    const cells = [[content]];
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-boxed.js
  function cleanText(node) {
    return (node ? node.textContent : "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function findTitle(panel, element) {
    let sib = panel.previousElementSibling;
    let fallback = null;
    while (sib && !sib.classList.contains("panelPP")) {
      const toggle = sib.matches(".accordionPP") ? sib : sib.querySelector(".accordionPP");
      if (toggle) {
        const anchor = toggle.closest("a");
        const id = (anchor && element.contains(anchor) ? anchor.id : "") || toggle.id || "";
        if (/^open/i.test(id)) return cleanText(toggle);
        if (!/close/i.test(id) || !fallback) fallback = fallback || cleanText(toggle);
      }
      sib = sib.previousElementSibling;
    }
    return fallback || "";
  }
  function parse2(element, { document: document2 }) {
    const srcHeading = element.querySelector("h2.wysiwyg-title, :scope > div > h2, h2");
    let heading = null;
    if (srcHeading && !srcHeading.closest(".panelPP")) {
      const text = cleanText(srcHeading);
      if (text) {
        heading = document2.createElement("h2");
        heading.textContent = text;
      }
    }
    const panels = Array.from(element.querySelectorAll(":scope > .panelPP"));
    const finalPanels = panels.length ? panels : Array.from(element.querySelectorAll(".panelPP"));
    const cells = [];
    finalPanels.forEach((panel) => {
      const title = findTitle(panel, element);
      const body = [];
      panel.querySelectorAll(":scope > ul, :scope > ol").forEach((list) => body.push(list));
      if (!body.length) {
        const links = Array.from(panel.querySelectorAll("a[href]"));
        if (links.length) {
          const ul = document2.createElement("ul");
          links.forEach((a) => {
            const li = document2.createElement("li");
            li.append(a);
            ul.append(li);
          });
          body.push(ul);
        } else {
          Array.from(panel.children).forEach((c) => {
            if (cleanText(c)) body.push(c);
          });
        }
      }
      if (!title && !body.length) return;
      cells.push([title, body.length ? body : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-boxed", cells });
    if (heading) element.before(heading);
    element.replaceWith(block);
  }

  // tools/importer/parsers/loan-calculator.js
  function cleanText2(node) {
    return (node ? node.textContent : "").replace(/ /g, " ").replace(/\s+/g, " ").trim().replace(/:$/, "").trim();
  }
  function parse3(element, { document: document2 }) {
    const srcHeading = element.querySelector("h2");
    let heading = null;
    if (srcHeading && cleanText2(srcHeading)) {
      heading = document2.createElement("h2");
      heading.textContent = cleanText2(srcHeading);
    }
    const tabs = [...element.querySelectorAll("#rblType label")].map(cleanText2);
    const terms = [...element.querySelectorAll('#rblMonths input[type="radio"]')].map((input) => input.value).filter(Boolean);
    const footnote = element.parentElement && element.parentElement.querySelector(".footnote");
    const disclaimer = cleanText2(footnote);
    if (footnote) {
      const holder = footnote.closest(".wysiwyg");
      if (holder && holder !== element && cleanText2(holder) === disclaimer) holder.remove();
      else footnote.remove();
    }
    const rows = [
      ["Payment Tab", tabs[0] || "Monthly Payment"],
      ["Payment Heading", cleanText2(element.querySelector("#lblFormHead")) || "Let's Calculate Your Monthly Payment"],
      ["Amount Tab", tabs[1] || "Loan Amount"],
      // only present in the source's inline script
      ["Amount Heading", "Let's Calculate Your Loan Amount"],
      ["Rate Label", cleanText2(element.querySelector("#lblInterest")) || "Interest Rate"],
      ["Term Label", cleanText2(element.querySelector("#lblYears")) || "Length of loan (in months)"],
      ["Terms", (terms.length ? terms : ["84", "120", "144", "180", "240"]).join(", ")],
      ["Results Heading", cleanText2(element.querySelector("#results-container h3")) || "Results"]
    ];
    if (disclaimer) rows.push(["Disclaimer", disclaimer]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "loan-calculator", cells: rows });
    if (heading) element.before(heading);
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-blog.js
  function cleanText3(node) {
    return (node ? node.textContent : "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function para(document2, text) {
    const p = document2.createElement("p");
    p.textContent = text;
    return p;
  }
  function parse4(element, { document: document2 }) {
    const items = [...element.querySelectorAll(':scope > [id="divBlogItem"]')];
    const finalItems = items.length ? items : [...element.querySelectorAll('[id="divBlogItem"]')];
    const cells = [];
    finalItems.forEach((item) => {
      const titleLink = item.querySelector("a.blog-title");
      const href = titleLink ? titleLink.getAttribute("href") : "";
      const img = item.querySelector('[id="divBlogImage"] img');
      const text = [];
      if (titleLink) {
        const h2 = document2.createElement("h2");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = cleanText3(titleLink);
        h2.append(a);
        text.push(h2);
      }
      const author = cleanText3(item.querySelector(".blog-author"));
      const date = cleanText3(item.querySelector(".blog-date"));
      if (author) text.push(para(document2, author));
      if (date) text.push(para(document2, date));
      const excerptEl = item.querySelector('[id="divBlogExcerpt"]');
      const btn = excerptEl && excerptEl.querySelector("a.blog-btn");
      if (excerptEl) {
        const clone = excerptEl.cloneNode(true);
        clone.querySelectorAll("a.blog-btn").forEach((a) => a.remove());
        const excerpt = cleanText3(clone);
        if (excerpt) text.push(para(document2, excerpt));
      }
      if (btn) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = btn.getAttribute("href") || href;
        a.textContent = cleanText3(btn);
        p.append(a);
        text.push(p);
      }
      if (!img && !text.length) return;
      cells.push([img || "", text]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-blog", cells });
    element.replaceChildren(block);
  }

  // tools/importer/parsers/form.js
  var FORM_JSON = {
    "/contact/": "contact-form.json"
  };
  function cleanText4(node) {
    return (node ? node.textContent : "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function parse5(element, { document: document2 }) {
    var _a;
    let path = "/contact/";
    try {
      path = new URL(((_a = document2.querySelector('link[rel="canonical"]')) == null ? void 0 : _a.href) || document2.location.href).pathname.toLowerCase();
    } catch (e) {
    }
    const jsonName = FORM_JSON[path] || FORM_JSON["/contact/"];
    const rows = [...element.querySelectorAll("tr")];
    const textRows = [];
    for (const tr of rows) {
      if (tr.querySelector("input, textarea, select")) break;
      const text = cleanText4(tr);
      if (text) textRows.push(text);
    }
    const before = [];
    if (textRows[0]) {
      const h2 = document2.createElement("h2");
      h2.textContent = textRows[0];
      before.push(h2);
    }
    textRows.slice(1).forEach((text) => {
      const p = document2.createElement("p");
      p.textContent = text;
      before.push(p);
    });
    const link = document2.createElement("a");
    link.href = jsonName;
    link.textContent = jsonName;
    const block = WebImporter.Blocks.createBlock(document2, { name: "Form", cells: [[link]] });
    element.before(...before);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse6(element, { document: document2 }) {
    let buttons = Array.from(element.querySelectorAll(".homeButton"));
    if (!buttons.length) {
      buttons = Array.from(element.querySelectorAll(":scope > div.columns"));
    }
    const row = [];
    buttons.forEach((button) => {
      const tile = button.closest("div.columns") || button;
      let srcLink = button.closest("a[href]");
      if (srcLink && !element.contains(srcLink)) srcLink = null;
      if (!srcLink && tile !== button) srcLink = tile.querySelector("a[href]");
      const strongEl = button.querySelector(".homeButtonLoan, strong, b");
      let smallText = "";
      button.childNodes.forEach((n) => {
        if (n === strongEl) return;
        if (n.nodeType === 3) smallText += n.textContent;
        else if (n.nodeType === 1 && n.tagName !== "BR") smallText += n.textContent;
      });
      smallText = smallText.replace(/\s+/g, " ").trim();
      const strongText = strongEl ? strongEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!smallText && !strongText) return;
      const a = document2.createElement("a");
      if (srcLink) a.href = srcLink.getAttribute("href");
      if (smallText) a.append(document2.createTextNode(smallText));
      if (smallText && strongText) a.append(document2.createElement("br"));
      if (strongText) {
        const strong = document2.createElement("strong");
        strong.textContent = strongText;
        a.append(strong);
      }
      const p = document2.createElement("p");
      p.append(a);
      row.push(p);
    });
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-logos.js
  function parse7(element, { document: document2 }) {
    let wrappers = Array.from(element.querySelectorAll(":scope > .containLogo"));
    if (!wrappers.length) wrappers = Array.from(element.querySelectorAll("img")).map((img) => img.closest("a") || img);
    const row = [];
    wrappers.forEach((w) => {
      const img = w.tagName === "IMG" ? w : w.querySelector("img");
      if (!img) return;
      const link = w.tagName === "A" ? w : w.querySelector("a[href]") || img.closest("a[href]");
      if (link && element.contains(link)) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.append(img);
        row.push(a);
      } else {
        row.push(img);
      }
    });
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-logos", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/bluewaterfinance-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    var _a;
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "iframe"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "form#mainForm .aspNetHidden",
        "input#__VIEWSTATE",
        "input#__VIEWSTATEGENERATOR",
        "input#__SCROLLPOSITIONX",
        "input#__SCROLLPOSITIONY",
        "input#__EVENTTARGET",
        "input#__EVENTARGUMENT"
      ]);
      WebImporter.DOMUtils.remove(element, [".cycle-slideshow > a.cycle-sentinel"]);
      const crumbLinks = [...element.querySelectorAll(".tunNavContain a")];
      const crumbs = crumbLinks.map((a) => a.textContent.replace(/\s+/g, " ").trim());
      const crumbLabel = crumbs.length > 1 ? crumbs[crumbs.length - 1] : "";
      if (crumbLabel) element.setAttribute("data-excat-breadcrumb-title", crumbLabel);
      const crumbParents = crumbLinks.slice(1, -1).map((a, i) => {
        const label = crumbs[i + 1];
        const href = (a.getAttribute("href") || "").toLowerCase().replace(/\/+$/, "");
        return href.startsWith("/") ? `${label} (${href})` : label;
      }).filter(Boolean).join(", ");
      if (crumbParents) element.setAttribute("data-excat-breadcrumb-parents", crumbParents);
      WebImporter.DOMUtils.remove(element, [".tunNavContain"]);
      element.querySelectorAll('a[id^="close"][id$="Button"]').forEach((a) => {
        const openId = a.id.replace(/^close/, "open");
        if (element.querySelector(`#${openId}`)) a.remove();
      });
      const POSTBACK_TARGETS = { lnkBtnInsurance: "https://www.boaterschoiceinsurance.com/quote/" };
      element.querySelectorAll('a[href^="javascript:__doPostBack"]').forEach((a) => {
        const hasContent = a.textContent.trim() !== "" || a.querySelector("img");
        if (!hasContent) {
          a.remove();
        } else if (POSTBACK_TARGETS[a.id]) {
          a.setAttribute("href", POSTBACK_TARGETS[a.id]);
        } else {
          a.replaceWith(...a.childNodes);
        }
      });
      WebImporter.DOMUtils.remove(element, ["#pnlContent > br"]);
      const doc = element.ownerDocument;
      element.querySelectorAll("span.boldBlue").forEach((span) => {
        const strong = doc.createElement("strong");
        while (span.firstChild) strong.appendChild(span.firstChild);
        span.replaceWith(strong);
      });
      element.querySelectorAll(".wysiwyg p, .wysiwyg").forEach((p) => {
        let last = p.lastChild;
        while (last) {
          const isBr = last.nodeType === 1 && last.tagName === "BR";
          const isBlankText = last.nodeType === 3 && last.textContent.replace(/[\s ]/g, "") === "";
          if (!isBr && !isBlankText) break;
          const prev = last.previousSibling;
          last.remove();
          last = prev;
        }
        if (last && last.nodeType === 3) {
          last.textContent = last.textContent.replace(/[\s ]+$/, "");
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#topContain",
        ".footerOuter",
        "#toTheTop",
        "#f-prev",
        "#f-next",
        ".feature-slides-overlay",
        "noscript",
        "script",
        "link",
        "style"
      ]);
      let origin = "https://bluewaterfinance.com";
      try {
        origin = new URL(((_a = payload == null ? void 0 : payload.params) == null ? void 0 : _a.originalURL) || (payload == null ? void 0 : payload.url)).origin;
      } catch (e) {
      }
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        if (/^\/[^/].*\.(pdf|docx?|xlsx?)(\?|#|$)/i.test(href) || /^\/(prequalify\/application|apply\/application|apply\/co-applicant)\/?(\?|#|$)/i.test(href)) {
          a.setAttribute("href", `${origin}${href}`);
        } else if (/^\/[^/]/.test(href)) {
          const [path, rest = ""] = href.split(/(?=[?#])/);
          const clean = path.split("/").map((seg) => seg.replace(/^-+|-+$/g, "")).join("/");
          if (clean !== path) a.setAttribute("href", `${clean}${rest}`);
        }
      });
    }
  }

  // tools/importer/transformers/bluewaterfinance-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/transformers/bluewaterfinance-metadata.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var HERO_SRC_ATTR = "data-excat-hero-src";
  function isContentPage(payload) {
    return !!(payload && payload.template && payload.template.name === "content-page");
  }
  function hasMetadataBlock(root) {
    return [...root.querySelectorAll("table")].some((t) => {
      const first = t.querySelector("th, td");
      return first && first.textContent.trim().toLowerCase() === "metadata";
    });
  }
  function transform3(hookName, element, payload) {
    var _a;
    if (!isContentPage(payload)) return;
    const doc = element.ownerDocument;
    if (hookName === TransformHook2.beforeTransform) {
      const heroImg = element.querySelector("#pnlSubPageImage img");
      const heroSrc = heroImg && (heroImg.src || heroImg.getAttribute("src"));
      if (heroSrc) element.setAttribute(HERO_SRC_ATTR, heroSrc);
    }
    if (hookName === TransformHook2.afterTransform) {
      const heroSrc = element.getAttribute(HERO_SRC_ATTR);
      element.removeAttribute(HERO_SRC_ATTR);
      const crumbTitle = element.getAttribute("data-excat-breadcrumb-title");
      element.removeAttribute("data-excat-breadcrumb-title");
      const crumbParents = element.getAttribute("data-excat-breadcrumb-parents");
      element.removeAttribute("data-excat-breadcrumb-parents");
      if (hasMetadataBlock(element)) return;
      const meta = WebImporter.Blocks.getMetadata(doc) || {};
      if (heroSrc) {
        const img = doc.createElement("img");
        img.src = heroSrc;
        meta.Image = img;
      }
      meta.Breadcrumbs = "true";
      if (crumbTitle) meta["Breadcrumb Title"] = crumbTitle;
      if (crumbParents) meta["Breadcrumb Parents"] = crumbParents;
      try {
        const { pathname } = new URL(((_a = payload.params) == null ? void 0 : _a.originalURL) || payload.url);
        if (/^\/blog\/[^/]+\/?$/i.test(pathname)) meta.Template = "blog-post";
      } catch (e) {
      }
      element.append(WebImporter.Blocks.getMetadataBlock(doc, meta));
    }
  }

  // tools/importer/import-content-page.js
  var parsers = {
    "hero-caption": parse,
    "accordion-boxed": parse2,
    "loan-calculator": parse3,
    "cards-blog": parse4,
    form: parse5,
    "columns-cta": parse6,
    "columns-logos": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "content-page",
    "description": "Inner content page: hero banner with caption, breadcrumb, main copy + sidebar (sub-nav, CTA tiles), boat line-up image, partner logos",
    "urls": [
      "https://bluewaterfinance.com/loans/",
      "https://bluewaterfinance.com/protection/",
      "https://bluewaterfinance.com/insurance/",
      "https://bluewaterfinance.com/prequalify/",
      "https://bluewaterfinance.com/apply/",
      "https://bluewaterfinance.com/dealer-tools/",
      "https://bluewaterfinance.com/loans/LoanCalculator/",
      "https://bluewaterfinance.com/about/",
      "https://bluewaterfinance.com/contact/",
      "https://bluewaterfinance.com/blog/",
      "https://bluewaterfinance.com/blog/helping-your-customers-navigate-boat-titling-a-guide-for-marine-dealers/",
      "https://bluewaterfinance.com/blog/-boat-insurance-why-offer-it-at-the-dealership/",
      "https://bluewaterfinance.com/blog/unlocking-success-the-benefits-of-a-diverse-lender-portfolio/",
      "https://bluewaterfinance.com/blog/maximize-success-during-boat-show-season/",
      "https://bluewaterfinance.com/about/testimonials/",
      "https://bluewaterfinance.com/about/faq/",
      "https://bluewaterfinance.com/about/protect-yourself-from-fraudulent-activity/"
    ],
    "blocks": [
      {
        "name": "hero-caption",
        "instances": [
          "#pnlSubPageImage"
        ]
      },
      {
        "name": "accordion-boxed",
        "instances": [
          "#pnlContent > .wysiwyg:has(.accordionPP)"
        ]
      },
      {
        "name": "loan-calculator",
        "instances": [
          "#pnlContent > .wysiwyg:has(#rblType)"
        ]
      },
      {
        "name": "cards-blog",
        "instances": [
          "#pnlContent:has(> #divBlogItem)"
        ]
      },
      {
        "name": "form",
        "instances": [
          "#pnlContent table.surveyTable"
        ]
      },
      {
        "name": "columns-cta",
        "instances": [
          ".mainContent > .row > .medium-3.columns center"
        ]
      },
      {
        "name": "columns-logos",
        "instances": [
          ".theLogos"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "hero",
        "selector": [
          "#pnlSubPageImage"
        ],
        "style": null,
        "blocks": [
          "hero-caption"
        ],
        "defaultContent": []
      },
      {
        "id": "2",
        "name": "main-content",
        "selector": [
          ".mainContent > .row > .pageContent"
        ],
        "style": "main-content",
        "blocks": [
          "accordion-boxed",
          "loan-calculator",
          "cards-blog",
          "form"
        ],
        "defaultContent": [
          "#pnlContent > .wysiwyg p",
          "#pnlContent > .wysiwyg h2",
          "#pnlContent > .wysiwyg ul"
        ]
      },
      {
        "id": "3",
        "name": "sidebar",
        "selector": [
          ".mainContent > .row > .medium-3.columns"
        ],
        "style": "sidebar",
        "blocks": [
          "columns-cta"
        ],
        "defaultContent": [
          "#nav-wrap ul.sublist"
        ]
      },
      {
        "id": "4",
        "name": "boat-lineup",
        "selector": [
          '.mainContent > div:has(img[alt="all different boats"])',
          ".mainContent > div:nth-child(2)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          'img[alt="all different boats"]'
        ]
      },
      {
        "id": "5",
        "name": "partners",
        "selector": [
          ".windowOuter:has(.theLogos)"
        ],
        "style": null,
        "blocks": [
          "columns-logos"
        ],
        "defaultContent": [
          ".financialPartnerHeading h2"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
    // builds the page Metadata block (incl. Breadcrumbs: true), so createMetadata is not called below
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_content_page_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_content_page_exports);
})();

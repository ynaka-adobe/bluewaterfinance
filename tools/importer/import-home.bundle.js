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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function captionFromDesc(desc, document2) {
    if (!desc) return "";
    const tmp = document2.createElement("div");
    tmp.innerHTML = desc;
    tmp.querySelectorAll(".btnClear, a").forEach((n) => n.remove());
    return tmp.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function parse(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(":scope > a:not(.cycle-sentinel)"));
    if (!slides.length) {
      slides = Array.from(element.querySelectorAll(":scope > img.slide-image:not(.cycle-sentinel), :scope > img.slide-image")).filter((v, i, a) => a.indexOf(v) === i);
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.tagName === "IMG" ? slide : slide.querySelector("img");
      if (!img) return;
      const desc = slide.getAttribute("data-cycle-desc") || img.getAttribute("data-cycle-desc");
      const captionText = captionFromDesc(desc, document2) || (img.getAttribute("alt") || "").trim();
      const href = slide.tagName === "A" ? slide.getAttribute("href") : null;
      const textCell = [];
      if (captionText) {
        const p = document2.createElement("p");
        p.textContent = captionText;
        textCell.push(p);
      }
      if (href) {
        const ctaP = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = "Learn More";
        ctaP.append(a);
        textCell.push(ctaP);
      }
      cells.push([img, textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse2(element, { document: document2 }) {
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

  // tools/importer/parsers/cards-services.js
  var clean = (t) => (t || "").replace(/\s+/g, " ").trim();
  function parse3(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".bannerinnercontainer"));
    if (!cards.length) cards = Array.from(element.querySelectorAll(".bannerpadright"));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img.bannerimage, img");
      const titleEl = card.querySelector(".bannertitle");
      const teaserEl = card.querySelector(".bannerinner");
      const link = card.querySelector("a[href]") || card.closest("a[href]");
      const titleText = clean(titleEl && titleEl.textContent);
      const teaserText = clean(teaserEl && teaserEl.textContent);
      if (!img && !titleText && !teaserText) return;
      const body = [];
      if (titleText) {
        const p = document2.createElement("p");
        if (link) {
          const a = document2.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = titleText;
          p.append(a);
        } else {
          p.textContent = titleText;
        }
        body.push(p);
      }
      if (teaserText) {
        const p = document2.createElement("p");
        p.textContent = teaserText;
        body.push(p);
      }
      cells.push([img || "", body.length ? body : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-services", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-logos.js
  function parse4(element, { document: document2 }) {
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
      const crumbs = element.querySelectorAll(".tunNavContain a");
      const crumbLabel = crumbs.length > 1 ? crumbs[crumbs.length - 1].textContent.trim() : "";
      if (crumbLabel) element.setAttribute("data-excat-breadcrumb-title", crumbLabel);
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
        if (/^\/[^/].*\.(pdf|docx?|xlsx?)(\?|#|$)/i.test(href)) a.setAttribute("href", `${origin}${href}`);
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

  // tools/importer/import-home.js
  var parsers = {
    "carousel-hero": parse,
    "columns-cta": parse2,
    "cards-services": parse3,
    "columns-logos": parse4
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Homepage: hero slideshow, CTA tiles, service cards, intro copy and partner logos",
    urls: [
      "https://bluewaterfinance.com/"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".feature-banner .cycle-slideshow"]
      },
      {
        name: "columns-cta",
        instances: ["#outterWrapper > .row.contentContainer:nth-of-type(3) .mainContent > .row"]
      },
      {
        name: "cards-services",
        instances: [".bannerContainer"]
      },
      {
        name: "columns-logos",
        instances: [".theLogos"]
      }
    ],
    sections: [
      {
        id: "1",
        name: "hero-slideshow",
        selector: [".feature-banner.cycle2absolute", ".cycle2main"],
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "2",
        name: "cta-tiles",
        selector: ["#outterWrapper > .row.contentContainer:nth-of-type(3)"],
        style: null,
        blocks: ["columns-cta"],
        defaultContent: []
      },
      {
        id: "3",
        name: "services",
        selector: [".windowOuter:has(.bannerContainer)", "#outterWrapper > .windowOuter:nth-of-type(4)"],
        style: null,
        blocks: ["cards-services"],
        defaultContent: [".windowOuter:has(.bannerContainer) .mainheading h2"]
      },
      {
        id: "4",
        name: "intro",
        selector: ["#outterWrapper > .row.contentContainer:has(.wysiwyg)", "#outterWrapper > .row.contentContainer:nth-of-type(5)"],
        style: null,
        blocks: [],
        defaultContent: [".mainheading h1", ".wysiwyg p", "img[alt='all different boats']"]
      },
      {
        id: "5",
        name: "partners",
        selector: [".windowOuter:has(.theLogos)", "#outterWrapper > .windowOuter:nth-of-type(6)"],
        style: null,
        blocks: ["columns-logos"],
        defaultContent: [".financialPartnerHeading h2"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
  var import_home_default = {
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
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
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
  return __toCommonJS(import_home_exports);
})();

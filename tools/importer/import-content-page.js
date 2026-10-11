/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCaptionParser from './parsers/hero-caption.js';
import accordionBoxedParser from './parsers/accordion-boxed.js';
import loanCalculatorParser from './parsers/loan-calculator.js';
import cardsBlogParser from './parsers/cards-blog.js';
import formParser from './parsers/form.js';
import columnsCtaParser from './parsers/columns-cta.js';
import columnsLogosParser from './parsers/columns-logos.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bluewaterfinance-cleanup.js';
import sectionsTransformer from './transformers/bluewaterfinance-sections.js';
import metadataTransformer from './transformers/bluewaterfinance-metadata.js';

// PARSER REGISTRY
const parsers = {
  'hero-caption': heroCaptionParser,
  'accordion-boxed': accordionBoxedParser,
  'loan-calculator': loanCalculatorParser,
  'cards-blog': cardsBlogParser,
  form: formParser,
  'columns-cta': columnsCtaParser,
  'columns-logos': columnsLogosParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (template: content-page)
const PAGE_TEMPLATE = {
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
        ".mainContent > div:has(img[alt=\"all different boats\"])",
        ".mainContent > div:nth-child(2)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "img[alt=\"all different boats\"]"
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

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
  // builds the page Metadata block (incl. Breadcrumbs: true), so createMetadata is not called below
  metadataTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
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
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root URL maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

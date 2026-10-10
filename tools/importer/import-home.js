/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsCtaParser from './parsers/columns-cta.js';
import cardsServicesParser from './parsers/cards-services.js';
import columnsLogosParser from './parsers/columns-logos.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bluewaterfinance-cleanup.js';
import sectionsTransformer from './transformers/bluewaterfinance-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-cta': columnsCtaParser,
  'cards-services': cardsServicesParser,
  'columns-logos': columnsLogosParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Homepage: hero slideshow, CTA tiles, service cards, intro copy and partner logos',
  urls: [
    'https://bluewaterfinance.com/',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.feature-banner .cycle-slideshow'],
    },
    {
      name: 'columns-cta',
      instances: ['#outterWrapper > .row.contentContainer:nth-of-type(3) .mainContent > .row'],
    },
    {
      name: 'cards-services',
      instances: ['.bannerContainer'],
    },
    {
      name: 'columns-logos',
      instances: ['.theLogos'],
    },
  ],
  sections: [
    {
      id: '1',
      name: 'hero-slideshow',
      selector: ['.feature-banner.cycle2absolute', '.cycle2main'],
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: '2',
      name: 'cta-tiles',
      selector: ['#outterWrapper > .row.contentContainer:nth-of-type(3)'],
      style: null,
      blocks: ['columns-cta'],
      defaultContent: [],
    },
    {
      id: '3',
      name: 'services',
      selector: ['.windowOuter:has(.bannerContainer)', '#outterWrapper > .windowOuter:nth-of-type(4)'],
      style: null,
      blocks: ['cards-services'],
      defaultContent: ['.windowOuter:has(.bannerContainer) .mainheading h2'],
    },
    {
      id: '4',
      name: 'intro',
      selector: ['#outterWrapper > .row.contentContainer:has(.wysiwyg)', '#outterWrapper > .row.contentContainer:nth-of-type(5)'],
      style: null,
      blocks: [],
      defaultContent: ['.mainheading h1', '.wysiwyg p', "img[alt='all different boats']"],
    },
    {
      id: '5',
      name: 'partners',
      selector: ['.windowOuter:has(.theLogos)', '#outterWrapper > .windowOuter:nth-of-type(6)'],
      style: null,
      blocks: ['columns-logos'],
      defaultContent: ['.financialPartnerHeading h2'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
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

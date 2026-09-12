/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';
import cardsParser from './parsers/cards.js';
import cardsAccountParser from './parsers/cards-account.js';
import cardsPromoParser from './parsers/cards-promo.js';
import carouselParser from './parsers/carousel.js';
import columnsParser from './parsers/columns.js';
import disclosureParser from './parsers/disclosure.js';
import heroParser from './parsers/hero.js';
import searchParser from './parsers/search.js';
import tabsParser from './parsers/tabs.js';
import widgetParser from './parsers/widget.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/rbc-cleanup.js';
import sectionsTransformer from './transformers/rbc-sections.js';

// PARSER REGISTRY
const parsers = {
  accordion: accordionParser,
  cards: cardsParser,
  'cards-account': cardsAccountParser,
  'cards-promo': cardsPromoParser,
  carousel: carouselParser,
  columns: columnsParser,
  disclosure: disclosureParser,
  hero: heroParser,
  search: searchParser,
  tabs: tabsParser,
  widget: widgetParser,
};

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'bank-accounts',
  description: 'RBC Bank Accounts pages (hub, listing, product detail) — starter wave',
  urls: [
    'https://www.rbcroyalbank.com/bank-accounts/index.html',
    'https://www.rbcroyalbank.com/bank-accounts/chequing-accounts.html',
    'https://www.rbcroyalbank.com/bank-accounts/signature-no-limit-banking.html',
  ],
  blocks: [
    { name: 'hero', instances: ['#banner-container div.banner-new-to-rbc', '#banner-container div.banner-student', '#banner-container div.banner-student-international', '#banner-container div.banner-new-to-canada'] },
    { name: 'widget', instances: ['#banner-container div.banner-help-me-choose'] },
    { name: 'tabs', instances: ['#dvl-wpr > main > section.account-list-sec div.acc-type-container'] },
    { name: 'cards-account', instances: ['#dvl-wpr > main > section.account-list-sec div.grid-wpr.eh-wpr'] },
    { name: 'cards', instances: ['#dvl-wpr > main > section.extra-benefits-top div.advantages-container', '#dvl-wpr > main > section.extra-benefits-btm > div.section-inner'] },
    { name: 'columns', instances: ['#dvl-wpr > main > section.pad-tb-dbl div.grid-wpr.eh-wpr', '#dvl-wpr > main > section.newcomers-content > div.section-inner'] },
    { name: 'carousel', instances: ['#dvl-wpr > main > section.rbc-vantage-sec div.vantage-carousel'] },
    { name: 'cards-promo', instances: ['#dvl-wpr > main > section:nth-of-type(7) div.pbap-benefits'] },
    { name: 'accordion', instances: ['#dvl-wpr > main > section:nth-of-type(9) div.faqs-container div.accordion'] },
    { name: 'search', instances: ['#dvl-wpr > main > section:nth-of-type(9) form#intellResponse_form'] },
    { name: 'disclosure', instances: ['#disclaimer > div.section-inner'] },
  ],
  sections: [
    { id: 'rc2', name: 'Hero + Account Finder', selector: ['#banner-container'], style: null },
    { id: 'rc3', name: 'What is a Bank Account', selector: ['#dvl-wpr > main > div.floating-cta-bnr', 'main > div.floating-cta-bnr'], style: null },
    { id: 'rc4', name: 'Apply for a Personal Bank Account', selector: ['#dvl-wpr > main > section.account-list-sec', 'main > section.account-list-sec'], style: null },
    { id: 'rc5', name: 'Extra Benefits Top', selector: ['#dvl-wpr > main > section.extra-benefits-top', 'main > section.extra-benefits-top'], style: null },
    { id: 'rc6', name: 'Extra Benefits Bottom', selector: ['#dvl-wpr > main > section.extra-benefits-btm', 'main > section.extra-benefits-btm'], style: null },
    { id: 'rc7', name: 'How to Open', selector: ['#dvl-wpr > main > section.pad-tb-dbl', 'main > section.pad-tb-dbl'], style: 'grey' },
    { id: 'rc8', name: 'RBC Vantage', selector: ['#dvl-wpr > main > section.rbc-vantage-sec', 'main > section.rbc-vantage-sec'], style: null },
    { id: 'rc9', name: 'Get more from everyday banking', selector: ['#dvl-wpr > main > section:nth-of-type(7)', 'main > section:nth-of-type(7)'], style: 'light' },
    { id: 'rc10', name: 'Compare / Newcomers', selector: ['#dvl-wpr > main > section.newcomers-content', 'main > section.newcomers-content'], style: null },
    { id: 'rc11', name: 'FAQ', selector: ['#dvl-wpr > main > section:nth-of-type(9)', 'main > section:nth-of-type(9)'], style: null },
    { id: 'rc12', name: 'Legal disclaimers', selector: ['#disclaimer'], style: null },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
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

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block (skip elements already replaced)
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

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. sanitized path (root → /index)
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

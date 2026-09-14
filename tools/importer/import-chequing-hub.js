/* eslint-disable */
/* global WebImporter */

import heroParser from './parsers/hero.js';
import widgetParser from './parsers/widget.js';
import tabsParser from './parsers/tabs.js';
import cardsAccountParser from './parsers/cards-account.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import carouselParser from './parsers/carousel.js';
import cardsPromoParser from './parsers/cards-promo.js';
import accordionParser from './parsers/accordion.js';
import disclosureParser from './parsers/disclosure.js';

import cleanupTransformer from './transformers/rbc-cleanup.js';
import sectionsTransformer from './transformers/rbc-sections.js';

const parsers = {
  'hero': heroParser,
  'widget': widgetParser,
  'tabs': tabsParser,
  'cards-account': cardsAccountParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'carousel': carouselParser,
  'cards-promo': cardsPromoParser,
  'accordion': accordionParser,
  'disclosure': disclosureParser,
};

const PAGE_TEMPLATE = {
  name: 'chequing-hub',
  description: "RBC Chequing Accounts hub/listing page — chequing wave",
  urls: ["https://www.rbcroyalbank.com/bank-accounts/chequing-accounts/"],
  blocks: [
    {
      "name": "hero",
      "instances": [
        "#banner-container div.banner-new-to-rbc"
      ]
    },
    {
      "name": "widget",
      "instances": [
        "#banner-container div.banner-help-me-choose"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        "#dvl-wpr > main > section.our-checking-accounts div.acc-type-container"
      ]
    },
    {
      "name": "cards-account",
      "instances": [
        "#dvl-wpr > main > section.our-checking-accounts div.tiles-container-desktop"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "#dvl-wpr > main > section:nth-of-type(3) div.col-wpr",
        "#dvl-wpr > main > section.pad-tb-dbl div.grid-wpr.eh-wpr"
      ]
    },
    {
      "name": "cards",
      "instances": [
        "#dvl-wpr > main > section.is-this-account-right div.col-wpr.eh-wpr"
      ]
    },
    {
      "name": "carousel",
      "instances": [
        "#dvl-wpr > main > section:nth-of-type(6) > div.desktop-only div.vantage-carousel-new-to-rbc"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        "#dvl-wpr > main > section:nth-of-type(7) div.pbap-benefits"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        "#dvl-wpr > main > section:nth-of-type(8) div.accordion.faq-content"
      ]
    },
    {
      "name": "disclosure",
      "instances": [
        "#disclaimer > div.section-inner"
      ]
    }
  ],
  sections: [
    {
      "id": "cq1",
      "name": "Breadcrumb + Page Heading",
      "selector": [
        "#dvl-wpr > main > #sticky-wrapper",
        "#sticky-wrapper"
      ],
      "style": null
    },
    {
      "id": "cq2",
      "name": "Hero — iPad Offer",
      "selector": [
        "#banner-container"
      ],
      "style": null
    },
    {
      "id": "cq3",
      "name": "What is a Chequing Account",
      "selector": [
        "#dvl-wpr > main > div.floating-cta-bnr",
        "main > div.floating-cta-bnr"
      ],
      "style": null
    },
    {
      "id": "cq4",
      "name": "Our Chequing Accounts",
      "selector": [
        "#dvl-wpr > main > section.our-checking-accounts",
        "main > section.our-checking-accounts"
      ],
      "style": null
    },
    {
      "id": "cq5",
      "name": "Chequing Account Guarantee",
      "selector": [
        "#dvl-wpr > main > section:nth-of-type(3)"
      ],
      "style": "grey"
    },
    {
      "id": "cq6",
      "name": "Not Sure Which Account (Help Options)",
      "selector": [
        "#dvl-wpr > main > section.is-this-account-right",
        "main > section.is-this-account-right"
      ],
      "style": null
    },
    {
      "id": "cq7",
      "name": "How to Open a Chequing Account",
      "selector": [
        "#dvl-wpr > main > section.pad-tb-dbl",
        "main > section.pad-tb-dbl"
      ],
      "style": null
    },
    {
      "id": "cq8",
      "name": "RBC Vantage",
      "selector": [
        "#dvl-wpr > main > section:nth-of-type(6)"
      ],
      "style": null
    },
    {
      "id": "cq9",
      "name": "Get More From Your Chequing Account",
      "selector": [
        "#dvl-wpr > main > section:nth-of-type(7)"
      ],
      "style": null
    },
    {
      "id": "cq10",
      "name": "Top Chequing Account Questions",
      "selector": [
        "#dvl-wpr > main > section:nth-of-type(8)"
      ],
      "style": null
    },
    {
      "id": "cq11",
      "name": "Legal Disclaimers",
      "selector": [
        "#disclaimer"
      ],
      "style": null
    }
  ],
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => { try { fn.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); } });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      elements.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element }));
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); } }
      else { console.warn(`No parser found for block: ${block.name}`); }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};

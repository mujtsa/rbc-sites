/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import cardsAccountParser from './parsers/cards-account.js';
import tableParser from './parsers/table.js';
import accordionParser from './parsers/accordion.js';
import disclosureParser from './parsers/disclosure.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/rbc-cleanup.js';
import sectionsTransformer from './transformers/rbc-sections.js';

const parsers = {
  'cards': cardsParser,
  'columns': columnsParser,
  'cards-account': cardsAccountParser,
  'table': tableParser,
  'accordion': accordionParser,
  'disclosure': disclosureParser,
};

const PAGE_TEMPLATE = {
  name: 'chequing-product',
  description: "RBC chequing product detail pages (e.g. Signature No Limit Banking) — chequing wave",
  urls: ["https://www.rbcroyalbank.com/bank-accounts/chequing-accounts/signature-no-limit-banking.html"],
  blocks: [
    {
      "name": "cards",
      "instances": [
        "#overview div.icon-copy-container div.icon-copy-group.component-bg-2",
        "#overview div.icon-copy-container div.desktop-only div.icon-copy-group",
        "#trusted-advisor div.trusted-advisor-container",
        "#management-and-assistance div.flex-row-gap-overflow"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "#premium-membership div.points-container",
        "#pros-and-cons",
        "#rbc-mobile-app div.section-inner.flex.gap-30",
        "#safe-with-us div.flex.gap-32.w-full"
      ]
    },
    {
      "name": "cards-account",
      "instances": [
        "#overview div.sticky-card-detail",
        "#other-chequing-accounts #more-cards-container",
        "#accounts-opened-together #more-cards-container"
      ]
    },
    {
      "name": "table",
      "instances": [
        "#account-features div.table-wpr.features-table"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        "#faqs div.accordion.faq-content"
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
      "id": "cp1",
      "name": "Breadcrumb + Page Heading",
      "selector": [
        "#overview div.sticky-wrapper.product-sticky-wrapper.desktop-only",
        "#overview div.left-content"
      ],
      "style": null
    },
    {
      "id": "cp2",
      "name": "Flexibility For Every Way You Bank",
      "selector": [
        "#sts",
        "#overview div#sts"
      ],
      "style": null
    },
    {
      "id": "cp3",
      "name": "Top Chequing Account Benefits",
      "selector": [
        "#overview div.icon-copy-container"
      ],
      "style": null
    },
    {
      "id": "cp4",
      "name": "Avion Rewards Premium Membership",
      "selector": [
        "#premium-membership",
        "#overview div#premium-membership"
      ],
      "style": "light-blue"
    },
    {
      "id": "cp5",
      "name": "This Account May / May Not Be Ideal + Pricing Card",
      "selector": [
        "#pros-and-cons",
        "#overview div.flex-wpr"
      ],
      "style": null
    },
    {
      "id": "cp6",
      "name": "Fees and Other Benefits",
      "selector": [
        "#account-features"
      ],
      "style": null
    },
    {
      "id": "cp7",
      "name": "Tailored Advice with a Trusted Advisor",
      "selector": [
        "#trusted-advisor"
      ],
      "style": null
    },
    {
      "id": "cp8",
      "name": "All Your Banking, in Your Hands (NOMI)",
      "selector": [
        "#management-and-assistance"
      ],
      "style": "grey"
    },
    {
      "id": "cp9",
      "name": "RBC Mobile App",
      "selector": [
        "#rbc-mobile-app"
      ],
      "style": null
    },
    {
      "id": "cp10",
      "name": "How We Keep Your Money Safe",
      "selector": [
        "#safe-with-us"
      ],
      "style": null
    },
    {
      "id": "cp11",
      "name": "Explore Other Chequing Accounts + Opened Together",
      "selector": [
        "#other-chequing-accounts"
      ],
      "style": null
    },
    {
      "id": "cp12",
      "name": "Frequently Asked Questions",
      "selector": [
        "#faqs"
      ],
      "style": null
    },
    {
      "id": "cp13",
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
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
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
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      } else { console.warn(`No parser found for block: ${block.name}`); }
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

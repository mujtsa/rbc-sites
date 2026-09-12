/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-account. Base: cards.
 * Source: div.grid-wpr.eh-wpr — two account product cards (.grid-half.acc-type).
 * Each card: title/subtitle band, account-type pill, feature checklist, price, CTAs.
 * Model (cards-account decorate): one row per card. A card row is a single cell
 * holding all of the account's content (no separate lead image in the source).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each account card is a top-level .grid-half (falls back to direct child divs).
  let cards = Array.from(element.querySelectorAll(':scope > .grid-half, :scope > div'));
  cards = cards.filter((c) => c.textContent.trim().length);

  cards.forEach((card) => {
    // Keep the full authored card content (title, checklist, pricing, CTAs) in one cell.
    // Strip decorative-only wrappers is unnecessary; the block decorator handles layout.
    const inner = card.querySelector('.rounded-corners') || card;
    cells.push([inner]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-account', cells });
  element.replaceWith(block);
}

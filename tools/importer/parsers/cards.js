/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards. Base: cards.
 * Sources: div.advantages-container (icon/video + heading + copy),
 *          section.extra-benefits-btm .section-inner (.left-col / .right-col).
 * Model: 2 columns — | image/icon | text (heading + description) | — one row per card.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Card items are the direct child divs of the container.
  let items = Array.from(element.querySelectorAll(':scope > div'));
  // Fallback: known card wrappers if direct children aren't the cards.
  if (!items.length) {
    items = Array.from(element.querySelectorAll('.general-advantage, .left-col, .right-col'));
  }

  items.forEach((card) => {
    // Visual media for the card: an icon/photo (img/picture) or a product video.
    const media = card.querySelector('img, picture, video');

    // Body: all headings and paragraphs (and any CTA links) belonging to the card.
    const bodyEls = Array.from(card.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
    const bodyCell = [];
    bodyEls.forEach((el) => bodyCell.push(el));

    // Only emit a card if it has real content.
    if (!media && !bodyCell.length) return;

    cells.push([media || '', bodyCell.length ? bodyCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}

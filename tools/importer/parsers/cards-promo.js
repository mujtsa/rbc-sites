/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: div.pbap-benefits (grid of promo tiles).
 * Promo tiles carry the .rounded-corners class: the navy "RBC Offers" callout,
 * the "Vantage Snapshot" tile, and the "Stay on top of your money" tile.
 * Model: 2 columns — | image | body (heading + copy) | — one row per tile.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Promo tiles. Prefer explicit tile wrappers; fall back to direct children.
  let tiles = Array.from(element.querySelectorAll(':scope > div > .callout, :scope > div > .rounded-corners, :scope > .rounded-corners'));
  if (!tiles.length) {
    tiles = Array.from(element.querySelectorAll(':scope > div'));
  }

  tiles.forEach((tile) => {
    // Lead/background image for the tile (skip inline brand logos when a larger image exists).
    const imgs = Array.from(tile.querySelectorAll('img, picture'));
    const media = imgs.length ? imgs[imgs.length - 1] : null;

    // Body text: headings and paragraphs of the tile.
    const bodyEls = Array.from(tile.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));

    if (!media && !bodyEls.length) return;
    cells.push([media || '', bodyEls.length ? bodyEls : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
